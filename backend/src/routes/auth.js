// Authentication İşlemleri
import { JWTManager } from '../utils/jwt.js';
import { ABTestManager } from '../utils/ab-testing.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '').replace('/auth', '');

  if (path === '/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }
  
  if (path === '/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }
  
  if (path === '/verify' && request.method === 'GET') {
    return handleVerify(request, env);
  }

  if (path === '/forgot-password' && request.method === 'POST') {
    return handleForgotPassword(request, env);
  }

  return new Response('Endpoint bulunamadı', { 
    status: 404,
    headers: corsHeaders
  });
}

async function handleLogin(request, env) {
  try {
    const { phone, password } = await request.json();
    
    const user = await env.DB.prepare(`
      SELECT id, phone, name, password_hash, ab_group, is_admin, is_active
      FROM users 
      WHERE phone = ? AND is_active = TRUE
    `).bind(phone).first();

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Kullanıcı bulunamadı' 
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Hatalı şifre' 
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const jwtManager = new JWTManager(env.JWT_SECRET);
    const token = await jwtManager.sign({
      userId: user.id,
      phone: user.phone,
      isAdmin: user.is_admin,
      abGroup: user.ab_group
    }, env.JWT_EXPIRES_IN);

    await ABTestManager.logEvent(env.DB, user.id, 'login', 'authentication');

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        abGroup: user.ab_group,
        isAdmin: user.is_admin,
        experimentalFeatures: await ABTestManager.getExperimentalFeatures(user.ab_group)
      }
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleRegister(request, env) {
  try {
    const { phone, name, email, password } = await request.json();
    
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE phone = ?
    `).bind(phone).first();

    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Bu telefon numarası zaten kayıtlı' 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const abGroup = ABTestManager.assignGroup(userId);
    const isAdmin = phone === env.ADMIN_PHONE;

    await env.DB.prepare(`
      INSERT INTO users (id, phone, name, email, password_hash, ab_group, is_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, phone, name, email, passwordHash, abGroup, isAdmin).run();

    const jwtManager = new JWTManager(env.JWT_SECRET);
    const token = await jwtManager.sign({
      userId, phone, isAdmin, abGroup
    }, env.JWT_EXPIRES_IN);

    await ABTestManager.logEvent(env.DB, userId, 'registration', 'authentication');

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        userId, phone, name, email, abGroup, isAdmin,
        experimentalFeatures: await ABTestManager.getExperimentalFeatures(abGroup)
      }
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Kayıt başarısız'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleVerify(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  return new Response(JSON.stringify({
    success: true,
    user: {
      userId: user.userId,
      phone: user.phone,
      name: user.name,
      isAdmin: user.isAdmin,
      abGroup: user.abGroup,
      experimentalFeatures: await ABTestManager.getExperimentalFeatures(user.abGroup)
    }
  }), {
    headers: corsHeaders
  });
}

async function handleForgotPassword(request, env) {
  try {
    const { phone } = await request.json();

    const user = await env.DB.prepare(`
      SELECT id, phone, password_hash FROM users WHERE phone = ? AND is_active = TRUE
    `).bind(phone).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Bu telefon numarası sistemde kayıtlı değil'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    console.log(`Şifre sıfırlama talebi: ${phone}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Şifreniz telefon numaranıza gönderildi'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Bir hata oluştu'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function requireAuth(request, env) {
  const authorization = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Yetkilendirme gerekli' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const token = authorization.substring(7);
  const jwtManager = new JWTManager(env.JWT_SECRET);
  
  try {
    const payload = await jwtManager.verify(token);
    return payload;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Geçersiz token' }), {
      status: 401,
      headers: corsHeaders
    });
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}
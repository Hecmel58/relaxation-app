// Admin Panel - Kullanıcı ve İçerik Yönetimi
import { requireAuth } from './auth.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/admin', '').replace('/admin', '');

  // Admin kontrolü
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  
  if (!user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), {
      status: 403,
      headers: corsHeaders
    });
  }

  // Routes
  if (path === '/users' && request.method === 'GET') {
    return getAllUsers(request, env);
  }
  
  if (path === '/users' && request.method === 'POST') {
    return createUser(request, env);
  }
  
  if (path.startsWith('/users/') && request.method === 'PUT') {
    return updateUser(request, env);
  }
  
  if (path.startsWith('/users/') && request.method === 'DELETE') {
    return deleteUser(request, env);
  }
  
  if (path === '/stats' && request.method === 'GET') {
    return getStatistics(request, env);
  }
  
  if (path === '/messages' && request.method === 'GET') {
    return getAllMessages(request, env);
  }
  
  if (path === '/forms' && request.method === 'GET') {
    return getAllForms(request, env);
  }

  if (path === '/sleep-data' && request.method === 'GET') {
    return getAllSleepData(request, env);
  }

  if (path.startsWith('/sleep-history/') && request.method === 'GET') {
    return getUserSleepHistory(request, env);
  }

  return new Response('Endpoint bulunamadı', { 
    status: 404,
    headers: corsHeaders
  });
}

// Tüm kullanıcıları listele
async function getAllUsers(request, env) {
  const url = new URL(request.url);
  const group = url.searchParams.get('group');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT id, phone, name, email, ab_group, is_admin, is_active, created_at FROM users';
  const params = [];
  
  if (group) {
    query += ' WHERE ab_group = ?';
    params.push(group);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const users = await env.DB.prepare(query).bind(...params).all();
  
  const countQuery = group 
    ? 'SELECT COUNT(*) as total FROM users WHERE ab_group = ?' 
    : 'SELECT COUNT(*) as total FROM users';
  const countParams = group ? [group] : [];
  const { total } = await env.DB.prepare(countQuery).bind(...countParams).first();

  return new Response(JSON.stringify({
    success: true,
    users: users.results,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  }), {
    headers: corsHeaders
  });
}

// Yeni kullanıcı oluştur
async function createUser(request, env) {
  try {
    const { phone, name, email, password, abGroup } = await request.json();
    
    if (!phone || !name || !password) {
      return new Response(JSON.stringify({ error: 'Telefon, ad ve şifre zorunludur' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Bu telefon numarası zaten kayıtlı' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const finalGroup = abGroup || (Math.random() < 0.5 ? 'control' : 'experiment');

    await env.DB.prepare(`
      INSERT INTO users (id, phone, name, email, password_hash, ab_group)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, phone, name, email || null, passwordHash, finalGroup).run();

    return new Response(JSON.stringify({
      success: true,
      userId,
      message: 'Kullanıcı başarıyla oluşturuldu'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Geçersiz veri: ' + error.message }), {
      status: 400,
      headers: corsHeaders
    });
  }
}

// Kullanıcı güncelle
async function updateUser(request, env) {
  try {
    const userId = request.url.split('/').pop();
    const { name, email, abGroup, isActive } = await request.json();

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (abGroup !== undefined) {
      updates.push('ab_group = ?');
      params.push(abGroup);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Güncellenecek veri yok' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    params.push(userId);
    await env.DB.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...params).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Kullanıcı güncellendi'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Güncelleme başarısız' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Kullanıcı sil
async function deleteUser(request, env) {
  const userId = request.url.split('/').pop();
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

  return new Response(JSON.stringify({
    success: true,
    message: 'Kullanıcı silindi'
  }), {
    headers: corsHeaders
  });
}

// İstatistikler
async function getStatistics(request, env) {
  const totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  const controlUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE ab_group = ?').bind('control').first();
  const experimentUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE ab_group = ?').bind('experiment').first();
  const totalSleepRecords = await env.DB.prepare('SELECT COUNT(*) as count FROM sleep_sessions').first();
  const avgSleepQuality = await env.DB.prepare('SELECT AVG(sleep_quality) as avg FROM sleep_sessions').first();
  const totalEvents = await env.DB.prepare('SELECT COUNT(*) as count FROM ab_test_events').first();

  return new Response(JSON.stringify({
    success: true,
    stats: {
      users: {
        total: totalUsers.count,
        control: controlUsers.count,
        experiment: experimentUsers.count
      },
      sleep: {
        totalRecords: totalSleepRecords.count,
        avgQuality: avgSleepQuality.avg || 0
      },
      events: {
        total: totalEvents.count
      }
    }
  }), {
    headers: corsHeaders
  });
}

// Tüm uyku verilerini getir
async function getAllSleepData(request, env) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const sessions = await env.DB.prepare(`
    SELECT 
      s.id,
      s.user_id,
      s.date as sleep_date,
      s.total_sleep_minutes as sleep_duration,
      s.sleep_quality,
      s.rem_duration,
      s.deep_sleep_duration,
      s.light_sleep_duration,
      s.awake_duration,
      s.sleep_efficiency,
      s.notes,
      s.created_at,
      u.name as user_name,
      u.phone as user_phone,
      u.ab_group
    FROM sleep_sessions s
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  return new Response(JSON.stringify({
    success: true,
    sessions: sessions.results
  }), {
    headers: corsHeaders
  });
}

// Kullanıcının uyku geçmişini getir
async function getUserSleepHistory(request, env) {
  const userId = request.url.split('/').pop();
  
  const sessions = await env.DB.prepare(`
    SELECT 
      id, user_id, date as sleep_date, total_sleep_minutes as sleep_duration,
      sleep_quality, rem_duration, deep_sleep_duration, light_sleep_duration,
      awake_duration, sleep_efficiency, notes, created_at
    FROM sleep_sessions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(userId).all();

  return new Response(JSON.stringify({
    success: true,
    sessions: sessions.results
  }), {
    headers: corsHeaders
  });
}

// Mesajlar
async function getAllMessages(request, env) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Mesajlar Firebase Firestore üzerinden yönetiliyor'
  }), {
    headers: corsHeaders
  });
}

// Formlar
async function getAllForms(request, env) {
  const forms = await env.DB.prepare(`
    SELECT 
      fs.id, fs.user_id, fs.form_type, fs.submitted_at,
      u.name as user_name, u.phone as user_phone
    FROM form_submissions fs
    LEFT JOIN users u ON fs.user_id = u.id
    ORDER BY fs.submitted_at DESC
    LIMIT 100
  `).all();

  return new Response(JSON.stringify({
    success: true,
    forms: forms.results
  }), {
    headers: corsHeaders
  });
}

// Helper
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
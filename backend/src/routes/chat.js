// Chat Metadata Yönetimi (Firebase Firestore ile çalışır)
import { requireAuth } from './auth.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function handleChat(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chat', '').replace('/chat', '');

  if (path === '/rooms' && request.method === 'GET') {
    return getUserChatRooms(request, env);
  }
  
  if (path === '/experts' && request.method === 'GET') {
    return getAvailableExperts(request, env);
  }

  if (path === '/unread-count' && request.method === 'GET') {
    return getUnreadMessageCount(request, env);
  }

  if (path === '/mark-read' && request.method === 'POST') {
    return markMessagesAsRead(request, env);
  }

  return new Response('Endpoint bulunamadı', { 
    status: 404,
    headers: corsHeaders
  });
}

// Kullanıcının chat odaları (metadata)
async function getUserChatRooms(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  return new Response(JSON.stringify({
    success: true,
    message: 'Chat odaları Firebase Firestore üzerinden yönetiliyor',
    userId: user.userId
  }), {
    headers: corsHeaders
  });
}

// Mevcut uzmanları listele
async function getAvailableExperts(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const experts = await env.DB.prepare(`
    SELECT id, name, email
    FROM users
    WHERE role = 'expert' AND is_active = TRUE
  `).all();

  return new Response(JSON.stringify({
    success: true,
    experts: experts.results
  }), {
    headers: corsHeaders
  });
}

// Okunmamış mesaj sayısını getir
async function getUnreadMessageCount(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    // Firestore'da okunmamış mesaj sayısı tutulacak
    // Şimdilik mock data döndürüyoruz
    // Gerçek implementasyon Firebase Admin SDK ile yapılacak
    
    // Basit bir D1 tablosu varsa buradan çekebiliriz
    // Yoksa Firebase'den çekilecek
    const unreadCount = 0; // Firebase'den gelecek

    return new Response(JSON.stringify({
      success: true,
      unreadCount
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      unreadCount: 0,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Mesajları okundu olarak işaretle
async function markMessagesAsRead(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const { chatRoomId } = await request.json();
    
    // Firebase Firestore'da mesajları okundu olarak işaretle
    // Gerçek implementasyon Firebase Admin SDK ile yapılacak
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Mesajlar okundu olarak işaretlendi'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
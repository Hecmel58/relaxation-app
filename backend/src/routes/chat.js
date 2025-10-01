// Chat Metadata Yönetimi
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

  if (path === '/send-message' && request.method === 'POST') {
    return sendMessage(request, env);
  }

  return new Response('Endpoint bulunamadı', { 
    status: 404,
    headers: corsHeaders
  });
}

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

async function getUnreadMessageCount(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const result = await env.DB.prepare(`
      SELECT COALESCE(SUM(message_count), 0) as total_unread
      FROM unread_messages
      WHERE user_id = ?
    `).bind(user.userId).first();

    return new Response(JSON.stringify({
      success: true,
      unreadCount: result?.total_unread || 0
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Unread count error:', error);
    return new Response(JSON.stringify({
      success: true,
      unreadCount: 0
    }), {
      headers: corsHeaders
    });
  }
}

async function markMessagesAsRead(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const { senderId } = await request.json();
    
    await env.DB.prepare(`
      UPDATE unread_messages 
      SET message_count = 0
      WHERE user_id = ? AND sender_id = ?
    `).bind(user.userId, senderId).run();

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

async function sendMessage(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const { receiverId, message } = await request.json();
    
    // Okunmamış mesaj sayacını artır
    await env.DB.prepare(`
      INSERT INTO unread_messages (id, user_id, sender_id, message_count, last_message_at)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, sender_id) 
      DO UPDATE SET 
        message_count = message_count + 1,
        last_message_at = CURRENT_TIMESTAMP
    `).bind(
      crypto.randomUUID(),
      receiverId,
      user.userId
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Mesaj gönderildi'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Send message error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
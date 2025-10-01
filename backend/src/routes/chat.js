// Chat Metadata Yönetimi (Firebase Firestore ile çalışır)
import { requireAuth } from './auth.js';

export async function handleChat(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/chat', '');

  if (path === '/rooms' && request.method === 'GET') {
    return getUserChatRooms(request, env);
  }
  
  if (path === '/experts' && request.method === 'GET') {
    return getAvailableExperts(request, env);
  }

  return new Response('Endpoint bulunamadı', { status: 404 });
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
    headers: { 'Content-Type': 'application/json' }
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
    headers: { 'Content-Type': 'application/json' }
  });
}
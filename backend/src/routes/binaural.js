// Binaural Sesler - Sadece Deney Grubu
import { requireAuth } from './auth.js';
import { ABTestManager } from '../utils/ab-testing.js';

export async function handleBinaural(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/binaural', '');

  if (path === '/sounds' && request.method === 'GET') {
    return getBinauralSounds(request, env);
  }
  
  if (path === '/sessions' && request.method === 'POST') {
    return createBinauralSession(request, env);
  }
  
  if (path === '/sessions' && request.method === 'GET') {
    return getBinauralSessions(request, env);
  }
  
  if (path === '/stats' && request.method === 'GET') {
    return getBinauralStats(request, env);
  }

  return new Response('Endpoint bulunamadı', { status: 404 });
}

// Binaural ses listesi
async function getBinauralSounds(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  if (user.abGroup !== 'experiment') {
    return new Response(JSON.stringify({ 
      error: 'Bu özellik beta testinde',
      message: 'Binaural sesler şu anda seçili kullanıcılara test ediliyor'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let query = `
    SELECT id, name, description, base_frequency, binaural_frequency, 
           duration, purpose, brainwave_type, url, is_premium, play_count, rating
    FROM binaural_sounds 
    WHERE is_active = TRUE
  `;
  const params = [];

  if (category) {
    query += ' AND brainwave_type = ?';
    params.push(category);
  }

  query += ' ORDER BY play_count DESC, rating DESC LIMIT 50';

  const sounds = await env.DB.prepare(query).bind(...params).all();

  await ABTestManager.logEvent(env.DB, user.userId, 'feature_access', 'binaural_page', {
    category,
    soundCount: sounds.results.length
  });

  return new Response(JSON.stringify({
    success: true,
    sounds: sounds.results,
    userGroup: user.abGroup
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Binaural session kaydet
async function createBinauralSession(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  if (user.abGroup !== 'experiment') {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { binauralContentId, durationSeconds, completionPercentage, moodBefore, moodAfter, notes } = await request.json();
    
    const sessionId = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO binaural_sessions 
      (id, user_id, binaural_content_id, duration_listened_minutes, completion_percentage, 
       mood_before, mood_after, session_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId, 
      user.userId, 
      binauralContentId, 
      Math.round(durationSeconds / 60),
      completionPercentage || 0,
      moodBefore || null,
      moodAfter || null,
      notes || null
    ).run();

    await env.DB.prepare(`
      UPDATE binaural_sounds 
      SET play_count = play_count + 1 
      WHERE id = ?
    `).bind(binauralContentId).run();

    await ABTestManager.logEvent(env.DB, user.userId, 'engagement', 'binaural_session', {
      contentId: binauralContentId,
      durationSeconds,
      completionPercentage
    });

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      message: 'Session kaydedildi'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Geçersiz veri' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Kullanıcı session geçmişi
async function getBinauralSessions(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const sessions = await env.DB.prepare(`
    SELECT 
      bs.id, bs.session_start, bs.duration_listened_minutes, 
      bs.completion_percentage, bs.mood_before, bs.mood_after,
      bc.name as sound_name, bc.brainwave_type
    FROM binaural_sessions bs
    LEFT JOIN binaural_sounds bc ON bs.binaural_content_id = bc.id
    WHERE bs.user_id = ?
    ORDER BY bs.session_start DESC
    LIMIT 50
  `).bind(user.userId).all();

  return new Response(JSON.stringify({
    success: true,
    sessions: sessions.results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// İstatistikler
async function getBinauralStats(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const stats = await env.DB.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      SUM(duration_listened_minutes) as total_minutes,
      AVG(completion_percentage) as avg_completion,
      AVG(mood_after - mood_before) as mood_improvement
    FROM binaural_sessions
    WHERE user_id = ?
  `).bind(user.userId).first();

  return new Response(JSON.stringify({
    success: true,
    stats
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
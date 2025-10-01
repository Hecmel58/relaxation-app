// Rahatlama İçerikleri (A/B Test - Sadece Experiment Grubu)
import { requireAuth } from './auth.js';
import { ABTestManager } from '../utils/ab-testing.js';

export async function handleRelaxation(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/relaxation', '');

  if (path === '/content' && request.method === 'GET') {
    return getRelaxationContent(request, env);
  }
  
  if (path === '/categories' && request.method === 'GET') {
    return getContentCategories(request, env);
  }
  
  if (path === '/track-usage' && request.method === 'POST') {
    return trackContentUsage(request, env);
  }

  return new Response('Endpoint bulunamadı', { status: 404 });
}

async function getRelaxationContent(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  // A/B Test kontrolü - sadece experiment grubu erişebilir
  if (user.abGroup !== 'experiment') {
    return new Response(JSON.stringify({ 
      error: 'Bu özellik beta testinde',
      message: 'Rahatlama sayfası şu anda seçili kullanıcılara test ediliyor'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let query = `
    SELECT id, title, description, type, url, thumbnail_url, duration, 
           category, subcategory, is_premium, view_count, like_count
    FROM relaxation_content 
    WHERE is_active = TRUE
  `;
  
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY view_count DESC, created_at DESC LIMIT ?';
  params.push(limit);

  const content = await env.DB.prepare(query).bind(...params).all();

  // A/B test event kaydet
  await ABTestManager.logEvent(env.DB, user.userId, 'feature_access', 'relaxation_page', {
    category,
    contentCount: content.results.length
  });

  return new Response(JSON.stringify({
    success: true,
    content: content.results,
    userGroup: user.abGroup,
    message: 'Rahatlama içerikleri yüklendi'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getContentCategories(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  if (user.abGroup !== 'experiment') {
    return new Response(JSON.stringify({ error: 'Bu özellik beta testinde' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const categories = await env.DB.prepare(`
    SELECT 
      category,
      subcategory,
      COUNT(*) as content_count,
      AVG(view_count) as avg_popularity
    FROM relaxation_content 
    WHERE is_active = TRUE
    GROUP BY category, subcategory
    ORDER BY category, avg_popularity DESC
  `).all();

  // Kategorileri grupla
  const groupedCategories = {};
  categories.results.forEach(item => {
    if (!groupedCategories[item.category]) {
      groupedCategories[item.category] = [];
    }
    groupedCategories[item.category].push({
      name: item.subcategory,
      count: item.content_count,
      popularity: Math.round(item.avg_popularity)
    });
  });

  return new Response(JSON.stringify({
    success: true,
    categories: groupedCategories
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function trackContentUsage(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const { contentId, interactionType, durationSeconds } = await request.json();
    
    // Etkileşimi kaydet
    await env.DB.prepare(`
      INSERT INTO user_content_interactions (id, user_id, content_type, content_id, interaction_type, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), user.userId, 'relaxation', contentId, interactionType, durationSeconds).run();

    // İçerik istatistiklerini güncelle
    if (interactionType === 'view') {
      await env.DB.prepare(`
        UPDATE relaxation_content 
        SET view_count = view_count + 1 
        WHERE id = ?
      `).bind(contentId).run();
    } else if (interactionType === 'like') {
      await env.DB.prepare(`
        UPDATE relaxation_content 
        SET like_count = like_count + 1 
        WHERE id = ?
      `).bind(contentId).run();
    }

    // A/B test için kaydet
    await ABTestManager.logEvent(env.DB, user.userId, 'engagement', 'relaxation_content', {
      contentId, interactionType, durationSeconds
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Kullanım kaydedildi' 
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
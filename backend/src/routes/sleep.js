// Uyku Takibi İşlemleri
import { requireAuth } from './auth.js';
import { ABTestManager } from '../utils/ab-testing.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function handleSleep(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/sleep', '').replace('/sleep', '');

  if (path === '/sessions' && request.method === 'GET') {
    return getSleepSessions(request, env);
  }
  
  if (path === '/sessions' && request.method === 'POST') {
    return createSleepSession(request, env);
  }
  
  if (path === '/analytics' && request.method === 'GET') {
    return getSleepAnalytics(request, env);
  }

  return new Response('Endpoint bulunamadı', { 
    status: 404,
    headers: corsHeaders
  });
}

async function getSleepSessions(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '30');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const sessions = await env.DB.prepare(`
    SELECT 
      id,
      user_id,
      date,
      bedtime,
      sleep_time,
      wake_time,
      total_sleep_minutes,
      rem_duration,
      deep_sleep_duration,
      light_sleep_duration,
      awake_duration,
      sleep_quality,
      sleep_efficiency,
      notes,
      mood_before_sleep,
      mood_after_sleep,
      created_at
    FROM sleep_sessions 
    WHERE user_id = ? 
    ORDER BY date DESC 
    LIMIT ? OFFSET ?
  `).bind(user.userId, limit, offset).all();

  return new Response(JSON.stringify({
    success: true,
    sessions: sessions.results
  }), {
    headers: corsHeaders
  });
}

async function createSleepSession(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const sessionData = await request.json();
    const sessionId = crypto.randomUUID();
    
    // Uyku süresi hesaplama - önce frontend'den gelen değeri kullan
    let totalSleepMinutes = sessionData.total_sleep_minutes || 0;
    
    // Eğer gönderilmediyse sleep_time ve wake_time'dan hesapla
    if (!totalSleepMinutes && sessionData.sleep_time && sessionData.wake_time) {
      const sleepTime = new Date(sessionData.sleep_time);
      const wakeTime = new Date(sessionData.wake_time);
      totalSleepMinutes = Math.round((wakeTime - sleepTime) / (1000 * 60));
    }
    
    // Eğer hala yoksa REM + Derin + Hafif uyku toplamını kullan
    if (!totalSleepMinutes) {
      totalSleepMinutes = (sessionData.rem_duration || 0) + 
                         (sessionData.deep_sleep_duration || 0) + 
                         (sessionData.light_sleep_duration || 0);
    }
    
    // Uyku verimliliğini hesapla
    const sleepEfficiency = calculateSleepEfficiency(sessionData, totalSleepMinutes);
    
    await env.DB.prepare(`
      INSERT INTO sleep_sessions (
        id, user_id, date, bedtime, sleep_time, wake_time, total_sleep_minutes,
        rem_duration, deep_sleep_duration, light_sleep_duration, awake_duration,
        sleep_quality, sleep_efficiency, notes, mood_before_sleep, mood_after_sleep
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId, user.userId, sessionData.date, sessionData.bedtime,
      sessionData.sleep_time, sessionData.wake_time, totalSleepMinutes,
      sessionData.rem_duration || 0, sessionData.deep_sleep_duration || 0,
      sessionData.light_sleep_duration || 0, sessionData.awake_duration || 0,
      sessionData.sleep_quality, sleepEfficiency, sessionData.notes || null,
      sessionData.mood_before_sleep, sessionData.mood_after_sleep
    ).run();

    // A/B test event kaydet
    await ABTestManager.logEvent(env.DB, user.userId, 'sleep_tracking', 'sleep_session', {
      sleepQuality: sessionData.sleep_quality,
      totalSleepMinutes
    });

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      totalSleepMinutes,
      message: 'Uyku kaydı başarıyla oluşturuldu'
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Sleep session create error:', error);
    return new Response(JSON.stringify({ 
      error: 'Geçersiz veri',
      message: error.message
    }), {
      status: 400,
      headers: corsHeaders
    });
  }
}

async function getSleepAnalytics(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'week';

  let dateFilter;
  switch (period) {
    case 'week':
      dateFilter = "date >= date('now', '-7 days')";
      break;
    case 'month':
      dateFilter = "date >= date('now', '-30 days')";
      break;
    case 'year':
      dateFilter = "date >= date('now', '-365 days')";
      break;
    default:
      dateFilter = "date >= date('now', '-30 days')";
  }

  // Genel uyku istatistikleri
  const analytics = await env.DB.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      AVG(total_sleep_minutes) as avg_sleep_duration,
      AVG(sleep_quality) as avg_sleep_quality,
      AVG(sleep_efficiency) as avg_sleep_efficiency,
      AVG(rem_duration) as avg_rem,
      AVG(deep_sleep_duration) as avg_deep_sleep,
      AVG(light_sleep_duration) as avg_light_sleep,
      MIN(sleep_quality) as worst_sleep_quality,
      MAX(sleep_quality) as best_sleep_quality,
      AVG(mood_before_sleep) as avg_mood_before,
      AVG(mood_after_sleep) as avg_mood_after
    FROM sleep_sessions 
    WHERE user_id = ? AND ${dateFilter}
  `).bind(user.userId).first();

  // Günlük trendler
  const trends = await env.DB.prepare(`
    SELECT 
      date,
      AVG(sleep_quality) as sleep_quality,
      AVG(total_sleep_minutes) as sleep_duration,
      AVG(sleep_efficiency) as sleep_efficiency
    FROM sleep_sessions 
    WHERE user_id = ? AND ${dateFilter}
    GROUP BY date
    ORDER BY date
  `).bind(user.userId).all();

  // Kişiselleştirilmiş öneriler
  const insights = generateSleepInsights(analytics, trends.results);

  return new Response(JSON.stringify({
    success: true,
    analytics,
    trends: trends.results,
    insights,
    period
  }), {
    headers: corsHeaders
  });
}

function calculateSleepEfficiency(sessionData, totalSleepMinutes) {
  if (!sessionData.bedtime || !sessionData.wake_time || !totalSleepMinutes) {
    return null;
  }
  
  const bedtime = new Date(sessionData.bedtime);
  const wakeTime = new Date(sessionData.wake_time);
  const timeInBed = (wakeTime - bedtime) / (1000 * 60); // dakika
  
  if (timeInBed <= 0) return null;
  
  return Math.round((totalSleepMinutes / timeInBed) * 100);
}

function generateSleepInsights(analytics, trends) {
  const insights = [];
  
  if (analytics.avg_sleep_quality < 6) {
    insights.push({
      type: 'warning',
      title: 'Uyku Kalitesi Düşük',
      message: 'Ortalama uyku kaliteniz optimumun altında. Uyku hijyeninizi iyileştirmeyi deneyin.',
      priority: 'high'
    });
  }
  
  if (analytics.avg_sleep_duration < 420) { // 7 saatten az
    insights.push({
      type: 'info',
      title: 'Kısa Uyku Süresi',
      message: 'Ortalama 7 saatten az uyuyorsunuz. Çoğu yetişkin 7-9 saat uykuya ihtiyaç duyar.',
      priority: 'medium'
    });
  }
  
  if (analytics.avg_sleep_efficiency && analytics.avg_sleep_efficiency < 85) {
    insights.push({
      type: 'tip',
      title: 'Uyku Verimliliği',
      message: 'Uyku verimliliğiniz artırılabilir. Yatakta geçirdiğiniz süreyi gerçek uyku süresiyle sınırlamaya çalışın.',
      priority: 'low'
    });
  }
  
  return insights;
}
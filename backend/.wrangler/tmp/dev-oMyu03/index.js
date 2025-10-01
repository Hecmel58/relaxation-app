var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-TSdbDV/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-TSdbDV/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../../AppData/Roaming/npm/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/utils/jwt.js
var JWTManager;
var init_jwt = __esm({
  "src/utils/jwt.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    JWTManager = class {
      static {
        __name(this, "JWTManager");
      }
      constructor(secret) {
        this.secret = secret;
      }
      async sign(payload, expiresIn = "7d") {
        const header = { alg: "HS256", typ: "JWT" };
        const now = Math.floor(Date.now() / 1e3);
        const exp = now + this.parseExpiration(expiresIn);
        const jwtPayload = { ...payload, iat: now, exp };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
        const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
      }
      async verify(token) {
        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("Ge\xE7ersiz token format\u0131");
        const [header, payload, signature] = parts;
        const expectedSignature = await this.createSignature(`${header}.${payload}`);
        if (signature !== expectedSignature) throw new Error("Ge\xE7ersiz imza");
        const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
        if (decodedPayload.exp < Math.floor(Date.now() / 1e3)) {
          throw new Error("Token s\xFCresi dolmu\u015F");
        }
        return decodedPayload;
      }
      async createSignature(data) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(this.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
        return this.base64UrlEncode(new Uint8Array(signature));
      }
      base64UrlEncode(data) {
        if (typeof data === "string") data = new TextEncoder().encode(data);
        const base64 = btoa(String.fromCharCode(...data));
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      }
      base64UrlDecode(data) {
        data = data.replace(/-/g, "+").replace(/_/g, "/");
        while (data.length % 4) data += "=";
        return atob(data);
      }
      parseExpiration(expiresIn) {
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (!match) return 3600;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case "s":
            return value;
          case "m":
            return value * 60;
          case "h":
            return value * 3600;
          case "d":
            return value * 86400;
          default:
            return 3600;
        }
      }
    };
  }
});

// src/utils/ab-testing.js
var ABTestManager;
var init_ab_testing = __esm({
  "src/utils/ab-testing.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    ABTestManager = class {
      static {
        __name(this, "ABTestManager");
      }
      static assignGroup(userId) {
        const hash = this.hashString(userId);
        return hash % 2 === 0 ? "control" : "experiment";
      }
      static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return Math.abs(hash);
      }
      static async logEvent(db, userId, eventType, featureName, metadata = {}) {
        const eventId = crypto.randomUUID();
        await db.prepare(`
      INSERT INTO ab_test_events (id, user_id, event_type, feature_name, metadata)
      VALUES (?, ?, ?, ?, ?)
    `).bind(eventId, userId, eventType, featureName, JSON.stringify(metadata)).run();
      }
      static async getExperimentalFeatures(abGroup) {
        if (abGroup === "experiment") {
          return ["relaxation_page", "binaural_sounds", "advanced_sleep_analytics"];
        }
        return [];
      }
    };
  }
});

// src/routes/auth.js
var auth_exports = {};
__export(auth_exports, {
  handleAuth: () => handleAuth,
  requireAuth: () => requireAuth
});
async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "");
  if (path === "/login" && request.method === "POST") {
    return handleLogin(request, env);
  }
  if (path === "/register" && request.method === "POST") {
    return handleRegister(request, env);
  }
  if (path === "/verify" && request.method === "GET") {
    return handleVerify(request, env);
  }
  return new Response("Endpoint bulunamad\u0131", { status: 404 });
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
      return new Response(JSON.stringify({ error: "Kullan\u0131c\u0131 bulunamad\u0131" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: "Hatal\u0131 \u015Fifre" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtManager = new JWTManager(env.JWT_SECRET);
    const token = await jwtManager.sign({
      userId: user.id,
      phone: user.phone,
      isAdmin: user.is_admin,
      abGroup: user.ab_group
    }, env.JWT_EXPIRES_IN);
    await ABTestManager.logEvent(env.DB, user.id, "login", "authentication");
    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        abGroup: user.ab_group,
        isAdmin: user.is_admin,
        experimentalFeatures: await ABTestManager.getExperimentalFeatures(user.ab_group)
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Sunucu hatas\u0131" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
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
      return new Response(JSON.stringify({ error: "Bu telefon numaras\u0131 zaten kay\u0131tl\u0131" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
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
      userId,
      phone,
      isAdmin,
      abGroup
    }, env.JWT_EXPIRES_IN);
    await ABTestManager.logEvent(env.DB, userId, "registration", "authentication");
    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: userId,
        phone,
        name,
        email,
        abGroup,
        isAdmin,
        experimentalFeatures: await ABTestManager.getExperimentalFeatures(abGroup)
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Kay\u0131t ba\u015Far\u0131s\u0131z" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleVerify(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  return new Response(JSON.stringify({
    success: true,
    user: {
      id: user.userId,
      phone: user.phone,
      isAdmin: user.isAdmin,
      abGroup: user.abGroup,
      experimentalFeatures: await ABTestManager.getExperimentalFeatures(user.abGroup)
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function requireAuth(request, env) {
  const authorization = request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Yetkilendirme gerekli" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const token = authorization.substring(7);
  const jwtManager = new JWTManager(env.JWT_SECRET);
  try {
    const payload = await jwtManager.verify(token);
    return payload;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Ge\xE7ersiz token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}
var init_auth = __esm({
  "src/routes/auth.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_jwt();
    init_ab_testing();
    __name(handleAuth, "handleAuth");
    __name(handleLogin, "handleLogin");
    __name(handleRegister, "handleRegister");
    __name(handleVerify, "handleVerify");
    __name(requireAuth, "requireAuth");
    __name(hashPassword, "hashPassword");
    __name(verifyPassword, "verifyPassword");
  }
});

// src/routes/sleep.js
var sleep_exports = {};
__export(sleep_exports, {
  handleSleep: () => handleSleep
});
async function handleSleep(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/sleep", "");
  if (path === "/sessions" && request.method === "GET") {
    return getSleepSessions(request, env);
  }
  if (path === "/sessions" && request.method === "POST") {
    return createSleepSession(request, env);
  }
  if (path === "/analytics" && request.method === "GET") {
    return getSleepAnalytics(request, env);
  }
  return new Response("Endpoint bulunamad\u0131", { status: 404 });
}
async function getSleepSessions(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "30");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const sessions = await env.DB.prepare(`
    SELECT * FROM sleep_sessions 
    WHERE user_id = ? 
    ORDER BY date DESC 
    LIMIT ? OFFSET ?
  `).bind(user.userId, limit, offset).all();
  return new Response(JSON.stringify({
    success: true,
    sessions: sessions.results
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function createSleepSession(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  try {
    const sessionData = await request.json();
    const sessionId = crypto.randomUUID();
    const sleepTime = new Date(sessionData.sleep_time);
    const wakeTime = new Date(sessionData.wake_time);
    const totalSleepMinutes = Math.round((wakeTime - sleepTime) / (1e3 * 60));
    const sleepEfficiency = calculateSleepEfficiency(sessionData);
    await env.DB.prepare(`
      INSERT INTO sleep_sessions (
        id, user_id, date, bedtime, sleep_time, wake_time, total_sleep_minutes,
        rem_duration, deep_sleep_duration, light_sleep_duration, awake_duration,
        sleep_quality, sleep_efficiency, notes, mood_before_sleep, mood_after_sleep
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      user.userId,
      sessionData.date,
      sessionData.bedtime,
      sessionData.sleep_time,
      sessionData.wake_time,
      totalSleepMinutes,
      sessionData.rem_duration || 0,
      sessionData.deep_sleep_duration || 0,
      sessionData.light_sleep_duration || 0,
      sessionData.awake_duration || 0,
      sessionData.sleep_quality,
      sleepEfficiency,
      sessionData.notes,
      sessionData.mood_before_sleep,
      sessionData.mood_after_sleep
    ).run();
    await ABTestManager.logEvent(env.DB, user.userId, "sleep_tracking", "sleep_session", {
      sleepQuality: sessionData.sleep_quality,
      totalSleepMinutes
    });
    return new Response(JSON.stringify({
      success: true,
      sessionId,
      message: "Uyku kayd\u0131 ba\u015Far\u0131yla olu\u015Fturuldu"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Ge\xE7ersiz veri" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function getSleepAnalytics(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "week";
  let dateFilter;
  switch (period) {
    case "week":
      dateFilter = "date >= date('now', '-7 days')";
      break;
    case "month":
      dateFilter = "date >= date('now', '-30 days')";
      break;
    case "year":
      dateFilter = "date >= date('now', '-365 days')";
      break;
    default:
      dateFilter = "date >= date('now', '-30 days')";
  }
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
  const insights = generateSleepInsights(analytics, trends.results);
  return new Response(JSON.stringify({
    success: true,
    analytics,
    trends: trends.results,
    insights,
    period
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
function calculateSleepEfficiency(sessionData) {
  if (!sessionData.bedtime || !sessionData.wake_time || !sessionData.total_sleep_minutes) {
    return null;
  }
  const bedtime = new Date(sessionData.bedtime);
  const wakeTime = new Date(sessionData.wake_time);
  const timeInBed = (wakeTime - bedtime) / (1e3 * 60);
  return sessionData.total_sleep_minutes / timeInBed * 100;
}
function generateSleepInsights(analytics, trends) {
  const insights = [];
  if (analytics.avg_sleep_quality < 6) {
    insights.push({
      type: "warning",
      title: "Uyku Kalitesi D\xFC\u015F\xFCk",
      message: "Ortalama uyku kaliteniz optimumun alt\u0131nda. Uyku hijyeninizi iyile\u015Ftirmeyi deneyin.",
      priority: "high"
    });
  }
  if (analytics.avg_sleep_duration < 420) {
    insights.push({
      type: "info",
      title: "K\u0131sa Uyku S\xFCresi",
      message: "Ortalama 7 saatten az uyuyorsunuz. \xC7o\u011Fu yeti\u015Fkin 7-9 saat uykuya ihtiya\xE7 duyar.",
      priority: "medium"
    });
  }
  if (analytics.avg_sleep_efficiency < 85) {
    insights.push({
      type: "tip",
      title: "Uyku Verimlili\u011Fi",
      message: "Uyku verimlili\u011Finiz art\u0131r\u0131labilir. Yatakta ge\xE7irdi\u011Finiz s\xFCreyi ger\xE7ek uyku s\xFCresiyle s\u0131n\u0131rlamaya \xE7al\u0131\u015F\u0131n.",
      priority: "low"
    });
  }
  return insights;
}
var init_sleep = __esm({
  "src/routes/sleep.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_auth();
    init_ab_testing();
    __name(handleSleep, "handleSleep");
    __name(getSleepSessions, "getSleepSessions");
    __name(createSleepSession, "createSleepSession");
    __name(getSleepAnalytics, "getSleepAnalytics");
    __name(calculateSleepEfficiency, "calculateSleepEfficiency");
    __name(generateSleepInsights, "generateSleepInsights");
  }
});

// src/routes/relaxation.js
var relaxation_exports = {};
__export(relaxation_exports, {
  handleRelaxation: () => handleRelaxation
});
async function handleRelaxation(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/relaxation", "");
  if (path === "/content" && request.method === "GET") {
    return getRelaxationContent(request, env);
  }
  if (path === "/categories" && request.method === "GET") {
    return getContentCategories(request, env);
  }
  if (path === "/track-usage" && request.method === "POST") {
    return trackContentUsage(request, env);
  }
  return new Response("Endpoint bulunamad\u0131", { status: 404 });
}
async function getRelaxationContent(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  if (user.abGroup !== "experiment") {
    return new Response(JSON.stringify({
      error: "Bu \xF6zellik beta testinde",
      message: "Rahatlama sayfas\u0131 \u015Fu anda se\xE7ili kullan\u0131c\u0131lara test ediliyor"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  let query = `
    SELECT id, title, description, type, url, thumbnail_url, duration, 
           category, subcategory, is_premium, view_count, like_count
    FROM relaxation_content 
    WHERE is_active = TRUE
  `;
  const params = [];
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  query += " ORDER BY view_count DESC, created_at DESC LIMIT ?";
  params.push(limit);
  const content = await env.DB.prepare(query).bind(...params).all();
  await ABTestManager.logEvent(env.DB, user.userId, "feature_access", "relaxation_page", {
    category,
    contentCount: content.results.length
  });
  return new Response(JSON.stringify({
    success: true,
    content: content.results,
    userGroup: user.abGroup,
    message: "Rahatlama i\xE7erikleri y\xFCklendi"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function getContentCategories(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  if (user.abGroup !== "experiment") {
    return new Response(JSON.stringify({ error: "Bu \xF6zellik beta testinde" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
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
  const groupedCategories = {};
  categories.results.forEach((item) => {
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
    headers: { "Content-Type": "application/json" }
  });
}
async function trackContentUsage(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;
  try {
    const { contentId, interactionType, durationSeconds } = await request.json();
    await env.DB.prepare(`
      INSERT INTO user_content_interactions (id, user_id, content_type, content_id, interaction_type, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), user.userId, "relaxation", contentId, interactionType, durationSeconds).run();
    if (interactionType === "view") {
      await env.DB.prepare(`
        UPDATE relaxation_content 
        SET view_count = view_count + 1 
        WHERE id = ?
      `).bind(contentId).run();
    } else if (interactionType === "like") {
      await env.DB.prepare(`
        UPDATE relaxation_content 
        SET like_count = like_count + 1 
        WHERE id = ?
      `).bind(contentId).run();
    }
    await ABTestManager.logEvent(env.DB, user.userId, "engagement", "relaxation_content", {
      contentId,
      interactionType,
      durationSeconds
    });
    return new Response(JSON.stringify({
      success: true,
      message: "Kullan\u0131m kaydedildi"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Ge\xE7ersiz veri" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var init_relaxation = __esm({
  "src/routes/relaxation.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_auth();
    init_ab_testing();
    __name(handleRelaxation, "handleRelaxation");
    __name(getRelaxationContent, "getRelaxationContent");
    __name(getContentCategories, "getContentCategories");
    __name(trackContentUsage, "trackContentUsage");
  }
});

// .wrangler/tmp/bundle-TSdbDV/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-TSdbDV/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.js
init_checked_fetch();
init_modules_watch_stub();
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path.startsWith("/api/auth")) {
        const { handleAuth: handleAuth2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const response = await handleAuth2(request, env);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
      if (path.startsWith("/api/sleep")) {
        const { handleSleep: handleSleep2 } = await Promise.resolve().then(() => (init_sleep(), sleep_exports));
        const response = await handleSleep2(request, env);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
      if (path.startsWith("/api/relaxation")) {
        const { handleRelaxation: handleRelaxation2 } = await Promise.resolve().then(() => (init_relaxation(), relaxation_exports));
        const response = await handleRelaxation2(request, env);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
      return new Response("\u{1F319} Fidbal API \xC7al\u0131\u015F\u0131yor! Backend haz\u0131r \u{1F680}", {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Sunucu hatas\u0131",
        message: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-TSdbDV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-TSdbDV/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

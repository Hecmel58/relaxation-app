export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === '/' || url.pathname === '/health' || url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          message: 'Fidbal API çalışıyor',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route handling - /api prefix ile veya onsuz
      if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/auth/')) {
        const { handleAuth } = await import('./routes/auth.js');
        return await handleAuth(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/sleep/') || url.pathname.startsWith('/sleep/')) {
        const { handleSleep } = await import('./routes/sleep.js');
        return await handleSleep(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/admin/') || url.pathname.startsWith('/admin/')) {
        const { handleAdmin } = await import('./routes/admin.js');
        return await handleAdmin(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/binaural/') || url.pathname.startsWith('/binaural/')) {
        const { handleBinaural } = await import('./routes/binaural.js');
        return await handleBinaural(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/chat/') || url.pathname.startsWith('/chat/')) {
        const { handleChat } = await import('./routes/chat.js');
        return await handleChat(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/forms/') || url.pathname.startsWith('/forms/')) {
        const { handleForms } = await import('./routes/forms.js');
        return await handleForms(request, env, ctx);
      }
      
      if (url.pathname.startsWith('/api/relaxation/') || url.pathname.startsWith('/relaxation/')) {
        const { handleRelaxation } = await import('./routes/relaxation.js');
        return await handleRelaxation(request, env, ctx);
      }

      // 404
      return new Response(JSON.stringify({ 
        error: 'Endpoint bulunamadı',
        path: url.pathname 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Global error:', error);
      return new Response(JSON.stringify({ 
        error: 'Sunucu hatası',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
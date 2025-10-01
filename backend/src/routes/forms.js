// Form Yönetimi - Google Forms Entegrasyonu
import { requireAuth } from './auth.js';

export async function handleForms(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/forms', '');

  if (path === '/list' && request.method === 'GET') {
    return getUserForms(request, env);
  }
  
  if (path === '/submit' && request.method === 'POST') {
    return submitForm(request, env);
  }
  
  if (path === '/types' && request.method === 'GET') {
    return getFormTypes(request, env);
  }

  return new Response('Endpoint bulunamadı', { status: 404 });
}

// Kullanıcının formlarını listele
async function getUserForms(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const forms = await env.DB.prepare(`
    SELECT id, form_type, form_title, submitted_at, reviewed_by, reviewed_at
    FROM form_submissions
    WHERE user_id = ?
    ORDER BY submitted_at DESC
  `).bind(user.userId).all();

  return new Response(JSON.stringify({
    success: true,
    forms: forms.results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Form gönderimi kaydet
async function submitForm(request, env) {
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  try {
    const { formType, googleFormId, formTitle, submissionData } = await request.json();
    
    const submissionId = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO form_submissions (id, user_id, form_type, google_form_id, form_title, submission_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      user.userId,
      formType,
      googleFormId || null,
      formTitle,
      JSON.stringify(submissionData)
    ).run();

    return new Response(JSON.stringify({
      success: true,
      submissionId,
      message: 'Form gönderildi'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Form gönderilemedi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Form tipleri
async function getFormTypes(request, env) {
  return new Response(JSON.stringify({
    success: true,
    formTypes: [
      { id: 'intake', name: 'Başvuru Formu', description: 'İlk başvuru formu' },
      { id: 'weekly', name: 'Haftalık Değerlendirme', description: 'Haftalık takip formu' },
      { id: 'assessment', name: 'Değerlendirme', description: 'Aylık değerlendirme formu' },
      { id: 'feedback', name: 'Geri Bildirim', description: 'Kullanıcı geri bildirimi' }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
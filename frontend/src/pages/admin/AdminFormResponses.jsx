import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import api from '../../api/axios';

function AdminFormResponses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormData, setNewFormData] = useState({
    title: '',
    description: '',
    google_form_url: ''
  });
  const [expandedResponse, setExpandedResponse] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchForms();
  }, [user, navigate]);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms/admin/all');
      setForms(response.data);
    } catch (error) {
      console.error('Form listesi yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId) => {
    try {
      const response = await api.get(`/forms/admin/responses/${formId}`);
      setResponses(response.data);
      setSelectedForm(formId);
    } catch (error) {
      console.error('Yanıtlar yükleme hatası:', error);
    }
  };

  const handleAddForm = async (e) => {
    e.preventDefault();
    
    if (!newFormData.google_form_url.includes('docs.google.com/forms')) {
      alert('❌ Lütfen geçerli bir Google Form linki giriniz!');
      return;
    }

    try {
      await api.post('/forms/admin/add', newFormData);
      alert('✅ Form başarıyla eklendi!');
      setShowAddForm(false);
      setNewFormData({ title: '', description: '', google_form_url: '' });
      fetchForms();
    } catch (error) {
      console.error('Form ekleme hatası:', error);
      alert('❌ Form eklenemedi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleActive = async (formId) => {
    try {
      await api.patch(`/forms/admin/${formId}/toggle`);
      fetchForms();
    } catch (error) {
      console.error('Form durumu değiştirme hatası:', error);
      alert('❌ İşlem başarısız!');
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!confirm('Bu formu ve tüm yanıtlarını silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/forms/admin/${formId}`);
      alert('✅ Form silindi!');
      setSelectedForm(null);
      setResponses([]);
      fetchForms();
    } catch (error) {
      console.error('Form silme hatası:', error);
      alert('❌ Form silinemedi!');
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) {
      alert('Dışa aktarılacak veri yok!');
      return;
    }

    const selectedFormData = forms.find(f => f.id === selectedForm);
    const csvRows = [];
    
    // Header
    csvRows.push(['Kullanıcı ID', 'Ad', 'Telefon', 'E-posta', 'Tarih', 'Yanıtlar'].join(','));
    
    // Data
    responses.forEach(response => {
      const row = [
        response.user_id,
        response.user_name || 'N/A',
        response.user_phone || 'N/A',
        response.user_email || 'N/A',
        new Date(response.created_at).toLocaleString('tr-TR'),
        `"${JSON.stringify(response.responses).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedFormData?.title || 'form'}_yanitlari_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Form Yönetimi</h1>
          <p className="text-slate-600 mt-1">Formları ekleyin, düzenleyin ve yanıtları görüntüleyin</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Form Ekle
        </button>
      </div>

      {/* Form Ekleme Paneli */}
      {showAddForm && (
        <Card className="bg-blue-50 border-2 border-blue-200">
          <form onSubmit={handleAddForm} className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Google Form Ekle</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Form Başlığı
              </label>
              <input
                type="text"
                value={newFormData.title}
                onChange={(e) => setNewFormData({ ...newFormData, title: e.target.value })}
                placeholder="Örn: Giriş Anketi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                value={newFormData.description}
                onChange={(e) => setNewFormData({ ...newFormData, description: e.target.value })}
                placeholder="Form hakkında kısa açıklama..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Google Form URL'si *
              </label>
              <input
                type="url"
                value={newFormData.google_form_url}
                onChange={(e) => setNewFormData({ ...newFormData, google_form_url: e.target.value })}
                placeholder="https://docs.google.com/forms/d/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Google Form'u açın → Sağ üstten "Gönder" → Link sekmesi → Linki kopyalayın
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Form Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Formlar Listesi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="relative hover:shadow-lg transition-shadow">
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                form.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {form.is_active ? '● Aktif' : '○ Pasif'}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-2 pr-20">
              {form.title}
            </h3>
            
            {form.description && (
              <p className="text-sm text-slate-600 mb-3">{form.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
              <span>👥 {form.response_count} kullanıcı</span>
              <span>📝 {form.total_responses} yanıt</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => fetchResponses(form.id)}
                className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                📊 Yanıtları Görüntüle
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(form.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.is_active
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {form.is_active ? '⏸ Pasif Yap' : '▶ Aktif Yap'}
                </button>
                
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  title="Formu Sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {forms.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Henüz form yok</h3>
            <p className="mt-1 text-sm text-slate-500">Yukarıdaki butondan yeni form ekleyin</p>
          </div>
        </Card>
      )}

      {/* Yanıtlar Paneli */}
      {selectedForm && (
        <Card className="bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Form Yanıtları: {forms.find(f => f.id === selectedForm)?.title}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV İndir
              </button>
              <button
                onClick={() => {
                  setSelectedForm(null);
                  setResponses([]);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Bu form için henüz yanıt bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <div key={response.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedResponse(expandedResponse === response.id ? null : response.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {response.user_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{response.user_name || 'İsimsiz'}</p>
                        <p className="text-sm text-slate-500">
                          {response.user_phone} • {new Date(response.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedResponse === response.id ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedResponse === response.id && (
                    <div className="px-4 py-4 bg-slate-50 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Yanıt Detayları:</h4>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(response.responses, null, 2)}
                        </pre>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        
                          href={`mailto:${response.user_email}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          📧 E-posta Gönder
                        </a>
                        <span className="text-slate-300">|</span>
                        
                          href={`tel:${response.user_phone}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          📞 Ara
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default AdminFormResponses;
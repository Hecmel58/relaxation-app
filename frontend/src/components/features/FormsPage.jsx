import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';
import api from '../../api/axios';

function FormsPage() {
  const { user } = useAuthStore();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, filled: 0 });
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms/types');
      const formData = Array.isArray(response.data) ? response.data : [];
      setForms(formData);
      const filledCount = formData.filter(f => f.is_filled).length;
      setStats({ total: formData.length, filled: filledCount });
    } catch (error) {
      console.error('Form yükleme hatası:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormFilled = async (formId) => {
    try {
      await api.post('/forms/responses', {
        form_type_id: formId,
        responses: { 
          filled: true, 
          timestamp: new Date().toISOString(),
          user_name: user?.name,
          user_phone: user?.phone
        }
      });
      
      // Formu yeniden yükle
      await fetchForms();
      setSelectedForm(null);
      alert('✅ Form başarıyla kaydedildi!');
    } catch (error) {
      console.error('Form kayıt hatası:', error);
      alert('⚠️ Form kaydedilemedi, ancak yanıtlarınız Google Form\'a gönderildi.');
    }
  };

  const handleOpenForm = (form) => {
    setSelectedForm(form);
  };

  const handleCloseForm = () => {
    if (selectedForm && !selectedForm.is_filled) {
      if (confirm('Formu doldurdunuz mu? Google Form\'da "Gönder" butonuna bastıysanız "Tamam" deyin.')) {
        handleFormFilled(selectedForm.id);
      } else {
        setSelectedForm(null);
      }
    } else {
      setSelectedForm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Formlar</h1>
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Henüz form yok</h3>
            <p className="mt-1 text-sm text-slate-500">Şu anda doldurulabilir form bulunmuyor.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Formlar</h1>
          <p className="text-slate-600 mt-1">Doldurmanız gereken formlar aşağıda listelenmektedir</p>
        </div>
        <div className="bg-primary-100 px-4 py-2 rounded-lg">
          <p className="text-sm text-primary-600 font-semibold">
            {stats.filled} / {stats.total} Form Dolduruldu
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {forms.map((form) => (
          <Card key={form.id} className="relative hover:shadow-lg transition-shadow">
            {form.is_filled && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ✓ Dolduruldu
                </span>
              </div>
            )}

            <h3 className="text-xl font-semibold text-slate-900 mb-2 pr-32">{form.title}</h3>
            
            {form.description && <p className="text-slate-600 mb-4">{form.description}</p>}
            
            {form.is_filled && form.last_filled_at && (
              <p className="text-sm text-slate-500 mb-4">
                Son doldurulma: {new Date(form.last_filled_at).toLocaleDateString('tr-TR', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
              </p>
            )}

            <button
              onClick={() => handleOpenForm(form)}
              className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${form.is_filled ? 'bg-slate-400 hover:bg-slate-500' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {form.is_filled ? 'Formu Tekrar Görüntüle' : 'Formu Doldur'}
            </button>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-slate-900">{selectedForm.title}</h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* iFrame */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedForm.google_form_url}
                className="w-full h-full border-0"
                title={selectedForm.title}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <p className="text-sm text-slate-600">
                ✅ Google Form'da "Gönder" butonuna bastıktan sonra aşağıdaki "Doldurdum" butonuna tıklayın
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedForm(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleFormFilled(selectedForm.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  ✅ Doldurdum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormsPage;
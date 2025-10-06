import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function AdminForms() {
  const [formSheets, setFormSheets] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get('/forms/types');
      if (response.data.success) {
        const forms = response.data.forms.map(form => ({
          title: form.title,
          formUrl: form.url,
          sheetsUrl: null, // Google Sheets URL'leri manuel eklenebilir
          responseCount: 'Henüz yanıt yok',
          lastResponse: '-',
          icon: getFormIcon(form.id),
          status: 'active'
        }));
        setFormSheets(forms);
      }
    } catch (error) {
      console.error('Formlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormIcon = (formId) => {
    const icons = {
      'personal': '📋',
      'stress': '📊',
      'nursing': '🏥',
      'psqi': '😴'
    };
    return icons[formId] || '📄';
  };

  const handleOpenSheet = (url) => {
    if (!url) {
      alert('Bu form için henüz yanıt yok');
      return;
    }
    window.open(url, '_blank');
    setOpenDropdown(null);
  };

  const handleOpenForm = (url) => {
    window.open(url, '_blank');
    setOpenDropdown(null);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Formlar yükleniyor...</div>
      </div>
    );
  }

  const activeCount = formSheets.filter(f => f.status === 'active').length;
  const totalResponses = formSheets.reduce((sum, f) => {
    const count = f.responseCount.match(/\d+/);
    return sum + (count ? parseInt(count[0]) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Google Form Yanıtları</h2>
          <p className="text-sm text-slate-600 mt-1">Tüm form yanıtları Google Sheets'te saklanır</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{formSheets.length}</div>
            <div className="text-sm text-slate-600 mt-1">Toplam Form</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-wellness-600">{activeCount}</div>
            <div className="text-sm text-slate-600 mt-1">Aktif Form</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">{totalResponses}</div>
            <div className="text-sm text-slate-600 mt-1">Toplam Yanıt</div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {formSheets.map((form, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-4xl">{form.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{form.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      form.status === 'active' 
                        ? 'bg-wellness-100 text-wellness-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {form.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">{form.responseCount}</span>
                    <span className="text-xs text-slate-400">Son yanıt: {form.lastResponse}</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Button
                  onClick={() => toggleDropdown(index)}
                  variant="outline"
                  size="sm"
                >
                  İşlemler ▼
                </Button>
                
                {openDropdown === index && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <button
                        onClick={() => handleOpenForm(form.formUrl)}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        📝 Formu Aç
                      </button>
                      <button
                        onClick={() => handleOpenSheet(form.sheetsUrl)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          form.sheetsUrl 
                            ? 'text-slate-700 hover:bg-slate-50' 
                            : 'text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={!form.sheetsUrl}
                      >
                        📊 Sheet'i Aç
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-primary-50 border-primary-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-primary-800 mb-2">Nasıl Çalışır?</h4>
            <ul className="text-primary-700 text-sm space-y-1">
              <li>• Kullanıcılar "Formlar" sayfasından formu doldurur</li>
              <li>• Yanıtlar otomatik olarak Google Sheets'e kaydedilir</li>
              <li>• "Sheet'i Aç" ile tüm yanıtları görüntüleyebilirsiniz</li>
              <li>• Sheets'te filtreleme, sıralama ve analiz yapabilirsiniz</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminForms;
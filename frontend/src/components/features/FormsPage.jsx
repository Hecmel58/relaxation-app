import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

function FormsPage() {
  const { user } = useAuthStore();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);

  const availableForms = [
    {
      id: 'weekly_sleep',
      title: 'Haftalık Uyku Değerlendirmesi',
      description: 'Son 7 günlük uyku kalitenizi değerlendirin',
      googleFormUrl: 'https://forms.gle/5gTwRgjEqK3AFFWT8',
      icon: '📊',
      status: 'active'
    },
    {
      id: 'stress_level',
      title: 'Stres Seviyesi Anketi',
      description: 'Günlük stres seviyenizi ölçün',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform',
      icon: '📈',
      status: 'active'
    },
    {
      id: 'life_quality',
      title: 'Yaşam Kalitesi Formu',
      description: 'Genel yaşam kalitenizi değerlendirin',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform',
      icon: '❤️',
      status: 'completed'
    }
  ];

  useEffect(() => {
    loadUserForms();
  }, []);

  const loadUserForms = async () => {
    try {
      const response = await api.get('/forms/list');
      setForms(response.data.forms || []);
    } catch (error) {
      console.error('Formlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClick = (form) => {
    setSelectedForm(form);
  };

  const handleCloseForm = () => {
    setSelectedForm(null);
  };

  // İframe modunda
  if (selectedForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedForm.title}</h2>
            <p className="text-slate-600">{selectedForm.description}</p>
          </div>
          <Button onClick={handleCloseForm} variant="outline">
            ← Geri Dön
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <iframe
            src={selectedForm.googleFormUrl}
            width="100%"
            height="800"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="w-full"
          >
            Yükleniyor...
          </iframe>
        </Card>
      </div>
    );
  }

  // Form listesi
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Değerlendirme Formları</h1>
        <p className="text-slate-600 mt-1">Periyodik değerlendirme formlarınızı doldurun</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableForms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{form.icon}</div>
              {form.status === 'active' && (
                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                  Aktif
                </span>
              )}
              {form.status === 'completed' && (
                <span className="px-3 py-1 bg-wellness-100 text-wellness-800 text-xs font-medium rounded-full">
                  Tamamlandı
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {form.title}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {form.description}
            </p>

            <Button 
              className="w-full" 
              onClick={() => handleFormClick(form)}
              variant={form.status === 'completed' ? 'outline' : 'primary'}
            >
              {form.status === 'completed' ? 'Tekrar Doldur' : 'Formu Doldur'}
            </Button>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Neden Form Dolduruyoruz?
            </h4>
            <p className="text-slate-600 text-sm">
              Bu değerlendirme formları sayesinde uyku kaliteniz ve genel sağlık durumunuz hakkında daha detaylı bilgi topluyoruz. 
              Bu veriler uzmanlarımızın size daha iyi öneriler bulunmasına yardımcı olur.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FormsPage;
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

function ProfilePage() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Store'dan kullanıcı verisini al
    if (user) {
      setProfileData({
        name: user.name || 'Belirtilmemiş',
        phone: user.phone || '',
        email: user.email || '',
        abGroup: user.abGroup || 'control',
        isAdmin: user.isAdmin || false
      });
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Profil bilgileri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-600 mt-1">Hesap bilgileriniz ve ayarlarınız</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hesap Bilgileri</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
            <div className="text-slate-900">{profileData.name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <div className="text-slate-900">{profileData.phone}</div>
          </div>

          {profileData.email && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
              <div className="text-slate-900">{profileData.email}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">A/B Test Grubu</label>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                profileData.abGroup === 'experiment' 
                  ? 'bg-warning-100 text-warning-800' 
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {profileData.abGroup === 'experiment' ? 'Deney Grubu' : 'Kontrol Grubu'}
              </span>
              {profileData.isAdmin && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-primary-50 border-primary-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-primary-800 mb-2">
              {profileData.abGroup === 'experiment' ? 'Deney Grubu Özellikleri' : 'Kontrol Grubu'}
            </h4>
            <p className="text-primary-700 text-sm">
              {profileData.abGroup === 'experiment' 
                ? 'Beta özelliklerine erişiminiz var: Rahatlama egzersizleri, Binaural sesler ve gelişmiş içerikler.'
                : 'Temel özelliklere erişiminiz var. Beta özellikler için deney grubuna geçmeniz gerekiyor.'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
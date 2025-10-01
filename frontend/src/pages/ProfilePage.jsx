import React from 'react';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';

function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-600 mt-1">Hesap bilgileriniz ve ayarlarınız</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Hesap Bilgileri</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Ad</label>
            <p className="text-slate-900">{user?.name || 'Belirtilmemiş'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Telefon</label>
            <p className="text-slate-900">{user?.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">A/B Test Grubu</label>
            <p className="text-slate-900">
              {user?.abGroup === 'experiment' ? 'Deney Grubu' : 'Kontrol Grubu'}
              {user?.abGroup === 'experiment' && (
                <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-800 rounded text-xs font-medium">
                  BETA
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
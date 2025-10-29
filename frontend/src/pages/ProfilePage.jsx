import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';

function ProfilePage() {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadData = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('fidbal_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/data/download`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }
      });
      
      if (!response.ok) {
        throw new Error('Veri indirme başarısız');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fidbal-verilerim-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('✅ Verileriniz başarıyla indirildi!');
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Veri indirme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('UYARI: Hesabınız ve TÜM verileriniz kalıcı olarak silinecektir. Bu işlem GERİ ALINAMAZ! Devam etmek istiyor musunuz?')) return;
    if (!confirm('SON UYARI: Bu işlem geri alınamaz! Tüm verileriniz silinecek. Emin misiniz?')) return;
    
    const confirmText = prompt('Hesabınızı silmek için SİL yazın:');
    if (confirmText !== 'SİL') { 
      alert('İptal edildi'); 
      return; 
    }
    
    try {
      const token = localStorage.getItem('fidbal_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Hesabınız başarıyla silindi. Güle güle!');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        throw new Error(data.error || 'Hesap silme başarısız');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('❌ Hesap silme sırasında bir hata oluştu: ' + error.message);
    }
  };

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
          {user?.email && (
            <div>
              <label className="text-sm font-medium text-slate-700">E-posta</label>
              <p className="text-slate-900">{user.email}</p>
            </div>
          )}
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

      <Card>
        <h3 className="text-lg font-semibold mb-4">Kişisel Verilerim (KVKK)</h3>
        <p className="text-sm text-slate-600 mb-4">
          6698 sayılı KVKK kapsamında kişisel verilerinizi indirebilir veya hesabınızı silebilirsiniz.
        </p>
        <div className="space-y-3">
          <button 
            onClick={handleDownloadData} 
            disabled={downloading} 
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {downloading ? 'İndiriliyor...' : 'Verilerimi İndir (JSON)'}
          </button>
          
          <button 
            onClick={handleDeleteAccount} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Hesabımı Kalıcı Olarak Sil
          </button>
          
          {/* ✅ DEĞİŞTİ: İki ayrı link eklendi */}
          <div className="space-y-2">
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center text-blue-600 hover:text-blue-700 hover:underline py-2 border border-blue-200 rounded-lg bg-blue-50"
            >
              📄 Kullanıcı Sözleşmesi
            </a>
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center text-blue-600 hover:text-blue-700 hover:underline py-2 border border-blue-200 rounded-lg bg-blue-50"
            >
              🔒 Gizlilik Politikası & KVKK Aydınlatma Metni
            </a>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Önemli:</strong> Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
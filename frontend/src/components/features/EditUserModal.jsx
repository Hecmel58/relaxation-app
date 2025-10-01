import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../api/axios';

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    ab_group: user.ab_group || 'control'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/admin/users/${user.id}`, {
        name: formData.name,
        email: formData.email || null,
        abGroup: formData.ab_group
      });

      if (response.data.success) {
        alert('Kullanıcı güncellendi!');
        onSuccess();
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert(error.response?.data?.error || 'Kullanıcı güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Kullanıcı Düzenle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefon Numarası
            </label>
            <input
              type="text"
              className="input w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100"
              value={user.phone}
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">Telefon numarası değiştirilemez</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ad Soyad *
            </label>
            <input
              type="text"
              className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-posta (opsiyonel)
            </label>
            <input
              type="email"
              className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              A/B Test Grubu
            </label>
            <select
              className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.ab_group}
              onChange={(e) => setFormData({...formData, ab_group: e.target.value})}
            >
              <option value="control">Kontrol Grubu</option>
              <option value="experiment">Deney Grubu (BETA)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData.ab_group === 'experiment' 
                ? 'Rahatlama ve Binaural sesler erişimi olacak' 
                : 'Sadece temel özellikler erişimi olacak'
              }
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUserModal;
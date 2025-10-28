import React, { useState } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';

function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    abGroup: user.ab_group || 'control',
    isAdmin: user.is_admin || false,
    isApproved: user.is_approved !== undefined ? user.is_approved : true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.put(`/admin/users/${user.id}`, {
        name: formData.name,
        email: formData.email || null,
        abGroup: formData.abGroup,
        isAdmin: formData.isAdmin,
        isApproved: formData.isApproved
      });

      if (response.data.success) {
        alert('Kullanıcı başarıyla güncellendi');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Kullanıcı Düzenle</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Telefon:</strong> {user.phone}
            </p>
          </div>

          <Input
            label="Ad Soyad"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ad Soyad"
            required
          />

          <Input
            label="E-posta"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@email.com"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Grup
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, abGroup: 'control' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.abGroup === 'control'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kontrol
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, abGroup: 'experiment' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.abGroup === 'experiment'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Deney
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <label htmlFor="isApproved" className="text-sm font-medium text-slate-700">
              Kullanıcı Onayı
            </label>
            <input
              type="checkbox"
              id="isApproved"
              checked={formData.isApproved}
              onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700">
              Admin Yetkisi
            </label>
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
import React, { useState } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';

function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    abGroup: 'control',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value });
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalıdır';
    }
    if (!/[a-z]/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir';
    }
    if (!/\d/.test(password)) {
      return 'Şifre en az bir rakam içermelidir';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Şifre en az bir özel karakter (@$!%*?&) içermelidir';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        abGroup: formData.abGroup,
        isAdmin: formData.isAdmin
      });

      if (response.data.success) {
        alert('Kullanıcı başarıyla eklendi');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details || 'Kullanıcı eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Yeni Kullanıcı Ekle</h3>
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

          <Input
            label="Ad Soyad"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ad Soyad"
            required
          />

          <Input
            label="Telefon Numarası"
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="5XX XXX XX XX"
            maxLength={11}
            required
          />

          <Input
            label="E-posta (Opsiyonel)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@email.com"
          />

          <Input
            label="Şifre"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            minLength={8}
            required
          />

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Şifre Gereksinimleri:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className={formData.password.length >= 8 ? 'text-green-700 font-semibold' : ''}>
                {formData.password.length >= 8 ? '✓' : '○'} En az 8 karakter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[a-z]/.test(formData.password) ? '✓' : '○'} En az 1 küçük harf (a-z)
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[A-Z]/.test(formData.password) ? '✓' : '○'} En az 1 büyük harf (A-Z)
              </li>
              <li className={/\d/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/\d/.test(formData.password) ? '✓' : '○'} En az 1 rakam (0-9)
              </li>
              <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-700 font-semibold' : ''}>
                {/[@$!%*?&]/.test(formData.password) ? '✓' : '○'} En az 1 özel karakter (@$!%*?&)
              </li>
            </ul>
          </div>

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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="mr-2 h-4 w-4 text-primary-600 border-slate-300 rounded"
            />
            <label htmlFor="isAdmin" className="text-sm text-slate-700">
              Admin Yetkisi Ver
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
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

export default AddUserModal;
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SleepForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    sleep_time: '23:00',
    wake_time: '07:00',
    rem_duration: 0,
    deep_sleep_duration: 0,
    light_sleep_duration: 0,
    awake_duration: 0,
    heart_rate: 0,
    night_awakenings: 0,
    snoring_level: 0,
    sleep_quality: 5,
    mood_before_sleep: 3,
    mood_after_sleep: 3,
    caffeine_intake: false,
    alcohol_intake: false,
    exercise_done: false,
    stress_level: 3,
    screen_time: 0,
    meal_time: '',
    medication_taken: false,
    meditation_done: false,
    reading_done: false,
    room_temperature: 20,
    notes: ''
  });

  const [activeSection, setActiveSection] = useState('basic');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sections = {
    basic: 'Temel Bilgiler',
    sleep: 'Uyku Aşamaları',
    factors: 'Etkileyen Faktörler',
    mood: 'Ruh Hali ve Notlar'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="flex space-x-2 overflow-x-auto">
          {Object.entries(sections).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {activeSection === 'basic' && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Temel Bilgiler</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yatma Saati</label>
                <input
                  type="time"
                  className="input"
                  value={formData.bedtime}
                  onChange={(e) => updateField('bedtime', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Uykuya Dalma Saati</label>
                <input
                  type="time"
                  className="input"
                  value={formData.sleep_time}
                  onChange={(e) => updateField('sleep_time', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Uyanma Saati</label>
                <input
                  type="time"
                  className="input"
                  value={formData.wake_time}
                  onChange={(e) => updateField('wake_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Genel Uyku Kalitesi: {formData.sleep_quality}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full"
                value={formData.sleep_quality}
                onChange={(e) => updateField('sleep_quality', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Çok Kötü</span>
                <span>Mükemmel</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gece Uyanma Sayısı</label>
              <input
                type="number"
                min="0"
                max="20"
                className="input"
                value={formData.night_awakenings}
                onChange={(e) => updateField('night_awakenings', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Horlama Seviyesi: {formData.snoring_level}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                className="w-full"
                value={formData.snoring_level}
                onChange={(e) => updateField('snoring_level', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Hiç</span>
                <span>Çok Yüksek</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'sleep' && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Uyku Aşamaları (Dakika)</h3>
          <p className="text-sm text-slate-600 mb-4">Xiaomi Band veya manuel tahmininize göre doldurun</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">REM Uykusu (Dakika)</label>
              <input
                type="number"
                min="0"
                max="600"
                className="input"
                value={formData.rem_duration}
                onChange={(e) => updateField('rem_duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Rüya fazı, hafıza konsolidasyonu</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Derin Uyku (Dakika)</label>
              <input
                type="number"
                min="0"
                max="600"
                className="input"
                value={formData.deep_sleep_duration}
                onChange={(e) => updateField('deep_sleep_duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Fiziksel iyileşme ve büyüme hormonu</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hafif Uyku (Dakika)</label>
              <input
                type="number"
                min="0"
                max="600"
                className="input"
                value={formData.light_sleep_duration}
                onChange={(e) => updateField('light_sleep_duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Geçiş fazı, uyku döngüleri arası</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Uyanık Kalma Süresi (Dakika)</label>
              <input
                type="number"
                min="0"
                max="600"
                className="input"
                value={formData.awake_duration}
                onChange={(e) => updateField('awake_duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Gece boyunca uyanık geçen toplam süre</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kalp Atım Hızı (bpm)</label>
              <input
                type="number"
                min="40"
                max="120"
                className="input"
                value={formData.heart_rate}
                onChange={(e) => updateField('heart_rate', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Uyku sırasında ortalama kalp atım hızı</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
              <div className="text-sm font-medium text-primary-900">Toplam Uyku Süresi</div>
              <div className="text-2xl font-bold text-primary-600">
                {formData.rem_duration + formData.deep_sleep_duration + formData.light_sleep_duration} dakika
              </div>
              <div className="text-xs text-primary-700 mt-1">
                ({((formData.rem_duration + formData.deep_sleep_duration + formData.light_sleep_duration) / 60).toFixed(1)} saat)
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'factors' && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Etkileyen Faktörler</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stres Seviyesi: {formData.stress_level}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full"
                value={formData.stress_level}
                onChange={(e) => updateField('stress_level', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Çok Düşük</span>
                <span>Çok Yüksek</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ekran Süresi (Dakika - Uyku öncesi 2 saat)
              </label>
              <input
                type="number"
                min="0"
                max="240"
                className="input"
                value={formData.screen_time}
                onChange={(e) => updateField('screen_time', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Oda Sıcaklığı (°C)</label>
              <input
                type="number"
                min="10"
                max="35"
                className="input"
                value={formData.room_temperature}
                onChange={(e) => updateField('room_temperature', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Son Yemek Saati</label>
              <input
                type="time"
                className="input"
                value={formData.meal_time}
                onChange={(e) => updateField('meal_time', e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.caffeine_intake}
                  onChange={(e) => updateField('caffeine_intake', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">Kafein tükettim (öğleden sonra)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.alcohol_intake}
                  onChange={(e) => updateField('alcohol_intake', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">Alkol tükettim</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.exercise_done}
                  onChange={(e) => updateField('exercise_done', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">Egzersiz yaptım</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.medication_taken}
                  onChange={(e) => updateField('medication_taken', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">İlaç kullandım</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.meditation_done}
                  onChange={(e) => updateField('meditation_done', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">Meditasyon/nefes egzersizi yaptım</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.reading_done}
                  onChange={(e) => updateField('reading_done', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-slate-700">Kitap okudum</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'mood' && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ruh Hali ve Notlar</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Uyku Öncesi Ruh Hali: {formData.mood_before_sleep}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
                value={formData.mood_before_sleep}
                onChange={(e) => updateField('mood_before_sleep', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Çok Kötü</span>
                <span>Çok İyi</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Uyanış Sonrası Ruh Hali: {formData.mood_after_sleep}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
                value={formData.mood_after_sleep}
                onChange={(e) => updateField('mood_after_sleep', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Çok Kötü</span>
                <span>Çok İyi</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notlar ve Gözlemler</label>
              <textarea
                className="input"
                rows="4"
                placeholder="Uykuyla ilgili dikkat çekici bir şey var mı? Rüyalar, fiziksel belirtiler, vb."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
          <Button type="submit">Kaydet</Button>
        </div>
      </Card>
    </form>
  );
};

export default SleepForm;
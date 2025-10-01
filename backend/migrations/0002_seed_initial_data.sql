-- Kullanıcılar zaten var, sadece içerikleri ekliyoruz

-- Rahatlama İçerikleri - Nefes Egzersizleri
INSERT OR IGNORE INTO relaxation_content (id, title, description, type, url, duration, category, subcategory, is_active)
VALUES 
('rel_1', '4-7-8 Nefes Tekniği', 'Stres ve kaygıyı azaltan klasik nefes egzersizi', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 240, 'breathing', 'deep_breathing', TRUE),
('rel_2', 'Karın Nefesi', 'Diyafram nefesi ile derin rahatlama', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 300, 'breathing', 'diaphragm', TRUE),
('rel_3', 'Box Breathing', 'Zihin netliği için ritmik nefes', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 600, 'breathing', 'rhythmic', TRUE);

-- Rahatlama İçerikleri - Meditasyon
INSERT OR IGNORE INTO relaxation_content (id, title, description, type, url, duration, category, subcategory, is_active)
VALUES 
('rel_4', 'Güzel Uyku Meditasyonu', '10 dakikalık uyku meditasyonu', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 600, 'meditation', 'sleep', TRUE),
('rel_5', 'Beden Taraması', 'Kas gevşetme için beden taraması', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 900, 'meditation', 'body_scan', TRUE);

-- Rahatlama İçerikleri - Doğa Sesleri
INSERT OR IGNORE INTO relaxation_content (id, title, description, type, url, duration, category, subcategory, is_active)
VALUES 
('rel_6', 'Orman Sesleri', 'Doğal orman ortam sesleri', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 3600, 'nature_sound', 'forest', TRUE),
('rel_7', 'Yağmur Sesi', 'Sakin yağmur sesi', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 3600, 'nature_sound', 'rain', TRUE),
('rel_8', 'Okyanus Dalgaları', 'Rahatlatan dalga sesleri', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 3600, 'nature_sound', 'ocean', TRUE);

-- Binaural Sesler - Delta Dalgalar (Derin Uyku)
INSERT OR IGNORE INTO binaural_sounds (id, name, description, base_frequency, binaural_frequency, duration, purpose, brainwave_type, url, is_active)
VALUES
('bin_1', 'Derin Uyku 1Hz', 'Derin uyku için delta dalgası', 100, 1, 3600, 'Derin uyku, fiziksel iyileşme', 'delta', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', TRUE),
('bin_2', 'Delta Karışım 2Hz', 'Tam gevşeme için delta frekansı', 100, 2, 3600, 'Derin rahatlama, meditasyon', 'delta', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', TRUE),
('bin_3', 'Tam Gevşeme 0.5Hz', 'Uykuya geçiş için ultra düşük frekans', 100, 0.5, 3600, 'Rahat uyku, stres azaltma', 'delta', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', TRUE);

-- Binaural Sesler - Theta Dalgalar (Meditasyon)
INSERT OR IGNORE INTO binaural_sounds (id, name, description, base_frequency, binaural_frequency, duration, purpose, brainwave_type, url, is_active)
VALUES
('bin_4', 'REM Uyku 6Hz', 'REM uykusu için theta dalgası', 200, 6, 2400, 'Derin rahatlama, meditasyon, REM uykusu', 'theta', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', TRUE),
('bin_5', 'Meditasyon 7Hz', 'Derin meditasyon için theta', 200, 7, 1800, 'Meditasyon, yaratıcılık', 'theta', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', TRUE);

-- Binaural Sesler - Alpha Dalgalar (Rahatlama)
INSERT OR IGNORE INTO binaural_sounds (id, name, description, base_frequency, binaural_frequency, duration, purpose, brainwave_type, url, is_active)
VALUES
('bin_6', 'Rahat Uyanıklık 10Hz', 'Rahat ama uyanık durum için alpha', 200, 10, 1800, 'Rahat uyanıklık, odaklanma', 'alpha', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', TRUE),
('bin_7', 'Odaklanma 12Hz', 'Konsantrasyon için alpha dalgası', 200, 12, 1800, 'Odaklanma, öğrenme', 'alpha', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', TRUE);
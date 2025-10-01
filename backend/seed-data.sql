-- Rahatlama İçerikleri
INSERT INTO relaxation_content (id, title, description, type, url, duration, category, subcategory, is_active)
VALUES 
('rel_1', '4-7-8 Nefes Tekniği', 'Stres ve kaygıyı azaltan klasik nefes egzersizi', 'video', 'https://www.youtube.com/watch?v=YRPh_GaiL8s', 240, 'breathing', 'deep_breathing', TRUE),
('rel_2', 'Karın Nefesi', 'Diyafram nefesi ile derin rahatlama', 'video', 'https://www.youtube.com/watch?v=8IgIVlmJIw4', 300, 'breathing', 'diaphragm', TRUE),
('rel_3', 'Box Breathing', 'Zihin netliği için ritmik nefes', 'video', 'https://www.youtube.com/watch?v=tEmt1Znux58', 600, 'breathing', 'rhythmic', TRUE),
('rel_4', 'Güzel Uyku Meditasyonu', '10 dakikalık uyku meditasyonu', 'audio', 'https://www.youtube.com/watch?v=aEqlQvczMJQ', 600, 'meditation', 'sleep', TRUE),
('rel_5', 'Orman Sesleri', 'Doğal orman ortam sesleri', 'audio', 'https://www.youtube.com/watch?v=eKFTSSKCzWA', 3600, 'nature_sound', 'forest', TRUE),
('rel_6', 'Yağmur Sesi', 'Sakin yağmur sesi', 'audio', 'https://www.youtube.com/watch?v=q76bMs-NwRk', 3600, 'nature_sound', 'rain', TRUE);

-- Binaural Sesler
INSERT INTO binaural_sounds (id, name, description, base_frequency, binaural_frequency, duration, purpose, brainwave_type, url, is_active)
VALUES
('bin_1', 'Derin Uyku 1Hz', 'Derin uyku için delta dalgası', 100, 1, 3600, 'Derin uyku, fiziksel iyileşme', 'delta', 'https://www.youtube.com/watch?v=1KJj6UgvuKU', TRUE),
('bin_2', 'Delta Karışım 2Hz', 'Tam gevşeme için delta frekansı', 100, 2, 3600, 'Derin rahatlama, meditasyon', 'delta', 'https://www.youtube.com/watch?v=wI9LqZKk_vU', TRUE),
('bin_3', 'Tam Gevşeme 0.5Hz', 'Uykuya geçiş için ultra düşük frekans', 100, 0.5, 3600, 'Rahat uyku, stres azaltma', 'delta', 'https://www.youtube.com/watch?v=3-YbLLcIWCw', TRUE),
('bin_4', 'REM Uyku 6Hz', 'REM uykusu için theta dalgası', 200, 6, 2400, 'Derin rahatlama, meditasyon, REM uykusu', 'theta', 'https://www.youtube.com/watch?v=M0r77opQjiY', TRUE),
('bin_5', 'Meditasyon 7Hz', 'Derin meditasyon için theta', 200, 7, 1800, 'Meditasyon, yaratıcılık', 'theta', 'https://www.youtube.com/watch?v=BoHuiTvZkMQ', TRUE),
('bin_6', 'Rahat Uyanıklık 10Hz', 'Rahat ama uyanık durum için alpha', 200, 10, 1800, 'Rahat uyanıklık, odaklanma', 'alpha', 'https://www.youtube.com/watch?v=dXLy3rMNZ1w', TRUE),
('bin_7', 'Odaklanma 12Hz', 'Konsantrasyon için alpha dalgası', 200, 12, 1800, 'Odaklanma, öğrenme', 'alpha', 'https://www.youtube.com/watch?v=WPni755-Krg', TRUE);
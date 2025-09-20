// backend/createAdmin.js - Güvenli admin oluşturma
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user');

async function createAdmin() {
  try {
    // Environment kontrolü
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI environment variable gerekli');
      console.log('📝 .env dosyasında MONGO_URI tanımlayın');
      process.exit(1);
    }
    
    if (!process.env.ADMIN_PHONE || !process.env.ADMIN_PASSWORD) {
      console.error('❌ ADMIN_PHONE ve ADMIN_PASSWORD environment variable\'ları gerekli');
      console.log('📝 .env dosyasında ADMIN_PHONE ve ADMIN_PASSWORD tanımlayın');
      process.exit(1);
    }

    // MongoDB bağlantısı
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı");

    const phone = process.env.ADMIN_PHONE;
    const plainPassword = process.env.ADMIN_PASSWORD;
    
    // Telefon numarası formatını kontrol et
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      console.error('❌ Geçersiz telefon numarası formatı');
      console.log('📝 Telefon numarası 10-11 rakam olmalı');
      process.exit(1);
    }

    // Şifre güçlülüğünü kontrol et
    if (plainPassword.length < 6) {
      console.error('❌ Şifre en az 6 karakter olmalı');
      process.exit(1);
    }

    console.log('🔐 Şifre hashlenıyor...');
    const hashedPassword = await bcrypt.hash(plainPassword, 12); // 12 round güvenli

    // Daha önce kayıtlı mı kontrol et
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log("⚠️  Bu telefon numarası zaten admin olarak kayıtlı.");
        console.log("👤 Admin bilgileri:", {
          id: existingUser._id,
          phone: existingUser.phone,
          name: existingUser.name,
          role: existingUser.role,
          createdAt: existingUser.createdAt
        });
      } else {
        // Normal kullanıcıyı admin yap
        existingUser.role = 'admin';
        existingUser.password = hashedPassword; // Şifreyi güncelle
        await existingUser.save();
        console.log("🎉 Mevcut kullanıcı admin yapıldı:", phone);
      }
      return;
    }

    // Yeni admin kaydı
    console.log('👤 Yeni admin oluşturuluyor...');
    const admin = new User({
      phone,
      password: hashedPassword,
      role: "admin",
      name: "Admin User" // Varsayılan isim
    });

    await admin.save();
    console.log("🎉 Admin başarıyla eklendi:", phone);
    console.log("🔐 Şifre güvenli bir şekilde hashlendi");
    
    // Admin bilgilerini göster (şifre hariç)
    const adminInfo = await User.findOne({ phone }).select('-password');
    console.log("👤 Admin bilgileri:", {
      id: adminInfo._id,
      phone: adminInfo.phone,
      name: adminInfo.name,
      role: adminInfo.role,
      createdAt: adminInfo.createdAt
    });

    console.log("\n🚀 Admin oluşturma tamamlandı!");
    console.log("📱 Giriş bilgileri:");
    console.log(`   Telefon: ${phone}`);
    console.log(`   Şifre: ${plainPassword}`);
    console.log("⚠️  Bu bilgileri güvenli bir yerde saklayın!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    if (error.code === 11000) {
      console.log("⚠️  Bu telefon numarası zaten kayıtlı");
    }
  } finally {
    await mongoose.connection.close();
    console.log("✅ Veritabanı bağlantısı kapatıldı");
    process.exit(0);
  }
}

// Script direkt çalıştırılırsa admin oluştur
if (require.main === module) {
  console.log("🔧 Admin oluşturma script'i başlatılıyor...\n");
  createAdmin();
}

module.exports = createAdmin;
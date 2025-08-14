// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user'); // User model yolunu senin proje yapına göre ayarla

async function createAdmin() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı");

    const phone = "5394870058";
    const plainPassword = "HecMel58";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Daha önce kayıtlı mı kontrol et
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log("⚠️ Bu telefon numarası zaten kayıtlı.");
      return;
    }

    // Yeni admin kaydı
    const admin = new User({
      phone,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("🎉 Admin başarıyla eklendi:", phone);

  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();

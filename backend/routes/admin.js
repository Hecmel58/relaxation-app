const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// 📌 Mevcut Admin Kodların
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Kullanıcılar alınamadı" });
    }
});

router.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Kullanıcı silindi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Kullanıcı silinemedi" });
    }
});

// 📌 Yeni: Admin oluşturma endpoint
router.post("/create-admin", async (req, res) => {
    try {
        const phone = "5394870058";
        const password = "HecMel58";

        // Admin var mı kontrol et
        let existingAdmin = await User.findOne({ phone, role: "admin" });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin zaten mevcut" });
        }

        // Şifre hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni admin oluştur
        const adminUser = new User({
            phone,
            password: hashedPassword,
            role: "admin"
        });

        await adminUser.save();
        res.json({ message: "Admin başarıyla oluşturuldu", admin: adminUser });
    } catch (err) {
        console.error("Admin oluşturma hatası:", err);
        res.status(500).json({ message: "Admin oluşturulamadı" });
    }
});

module.exports = router;

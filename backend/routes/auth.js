import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Kullanıcı kaydı
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Eksik alan kontrolü
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tüm alanlar zorunludur." });
        }

        // Kullanıcı var mı kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
        }

        // Yeni kullanıcı oluştur
        const newUser = new User({
            username,
            email,
            password,
            role: role || "user",
        });

        await newUser.save();

        res.status(201).json({ message: "Kayıt başarılı!" });
    } catch (err) {
        console.error("Kayıt hatası:", err);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});

// Giriş yapma
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Alan kontrolü
        if (!email || !password) {
            return res.status(400).json({ message: "Tüm alanlar zorunludur." });
        }

        // Kullanıcı var mı kontrolü
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
        }

        // Şifre kontrolü
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
        }

        // JWT oluşturma
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Giriş başarılı!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (err) {
        console.error("Giriş hatası:", err);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});

export default router;

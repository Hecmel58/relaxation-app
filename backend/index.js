import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🌍 CORS ayarları — Cloudflare domain’ini buraya ekle
const allowedOrigins = [
    "https://relaxation-frontend.pages.dev", // Cloudflare production domain
    "http://localhost:5173" // local development
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS policy: Origin not allowed"));
            }
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(bodyParser.json());

// Supabase bağlantısı
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test endpoint
app.get("/", (req, res) => {
    res.send("Backend çalışıyor 🚀");
});

// Giriş endpoint'i
app.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: "Telefon numarası ve şifre gereklidir" });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .eq("password", password)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Telefon numarası veya şifre hatalı" });
        }

        return res.json({
            message: user.role === "admin" ? "Admin girişi başarılı" : "Kullanıcı girişi başarılı",
            role: user.role,
            user
        });
    } catch (err) {
        console.error("Giriş hatası:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

// Sunucu başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});

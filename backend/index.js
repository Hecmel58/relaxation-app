import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
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

        // Kullanıcıyı veritabanında kontrol et
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .eq("password", password) // Burada hash kontrolü eklenebilir
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Telefon numarası veya şifre hatalı" });
        }

        // Admin kontrolü
        if (user.role === "admin") {
            return res.json({ message: "Admin girişi başarılı", role: "admin", user });
        }

        return res.json({ message: "Kullanıcı girişi başarılı", role: "user", user });

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

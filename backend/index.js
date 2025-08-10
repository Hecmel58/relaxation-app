import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import meditationRoutes from "./routes/meditations.js";
import journalRoutes from "./routes/journals.js";

// 📌 .env yükle
dotenv.config();

// 📌 MongoDB bağlantısı
async function connectMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DBNAME,
        });
        console.log("✅ MongoDB bağlantısı başarılı");
    } catch (error) {
        console.error("❌ MongoDB bağlantı hatası:", error);
        process.exit(1);
    }
}
connectMongoDB();

// 📌 Supabase bağlantısı
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

// 🌍 CORS ayarları — Cloudflare domain’ini buraya ekle
const allowedOrigins = [
    "https://ee30dd4a.relaxation-app.pages.dev", // Cloudflare production
    "http://localhost:5173" // local development
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy: Origin not allowed"));
        }
    },
    credentials: true
}));

app.use(bodyParser.json());

// 📌 Rotalar
app.use("/api/auth", authRoutes);
app.use("/api/meditations", meditationRoutes);
app.use("/api/journals", journalRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});

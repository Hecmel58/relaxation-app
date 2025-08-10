import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import meditationRoutes from "./routes/meditations.js";
import journalRoutes from "./routes/journals.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

// 🌍 CORS ayarları — Cloudflare domain’ini buraya ekle
const allowedOrigins = [
    "https://ee30dd4a.relaxation-app.pages.dev", // Cloudflare production domain
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
    console.log(`Server ${PORT} portunda çalışıyor`);
});

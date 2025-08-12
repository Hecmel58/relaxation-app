import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Configure with environment variables or hardcode for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://hkrmexglknnmvpixujcb.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "REPLACE_WITH_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Login
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "phone and password required" });

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !data) return res.status(401).json({ error: "Telefon numarası bulunamadı" });

  const match = await bcrypt.compare(password, data.password_hash);
  if (!match) return res.status(401).json({ error: "Şifre hatalı" });

  res.json({ message: "Giriş başarılı", role: data.role });
});

// Admin add user (very small example)
app.post("/api/admin/add-user", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "phone and password required" });
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert([{ phone, password_hash: hash, role: "user" }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Kullanıcı eklendi", user: data[0] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));

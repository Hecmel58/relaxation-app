// api.ts

const API_BASE_URL = "https://relaxation-app.onrender.com"; // Backend Render URL
const SUPABASE_URL = "https://hkrmexglknnmvpixujcb.supabase.co"; // Supabase URL
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrcm1leGdsa25ubXZwaXh1amNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDc1MjYsImV4cCI6MjA3MDUyMzUyNn0.tz_rhi7_N9m_ZPopZ60THqb3rQA2IsIHR8PqqOqLM4A";

const token = localStorage.getItem("token");

export async function apiGet(path: string) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
    });
    return res.json();
}

export async function apiPost(path: string, body: any) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function supabaseGet(endpoint: string) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
        },
    });
    return res.json();
}

export async function supabasePost(endpoint: string, body: any) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        method: "POST",
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

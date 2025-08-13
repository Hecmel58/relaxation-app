import axios, { AxiosRequestConfig } from "axios";

const baseURL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://relaxation-app.onrender.com";

export const api = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: false
});

// Token ekleme (Authorization: Bearer <token>)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// ---- Hazır yardımcılar ----
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then(r => r.data);

export const get =  <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then(r => r.data);

// ---- Auth örnekleri ----
export const register = (payload: { email: string; password: string; name?: string }) =>
    post<{ token: string; user: any }>("/auth/register", payload);

export const login = (payload: { email: string; password: string }) =>
    post<{ token: string; user: any }>("/auth/login", payload);

export const me = () =>
    get<{ id: string; email: string; name: string }>("/auth/me");

// ---- Örnek veri ----
export const getMeditations = () => get("/meditations");
export const getJournals    = () => get("/journals");
export const createJournal  = (text: string) => post("/journals", { text });

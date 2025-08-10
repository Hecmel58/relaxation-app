import axios from "axios";

const API = axios.create({
    baseURL: "https://relaxation-app.onrender.com", // ✅ Backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

// İstek öncesi token ekleme
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const login = (formData: any) => API.post("/auth/login", formData);
export const register = (formData: any) => API.post("/auth/register", formData);
export const getContents = () => API.get("/contents");

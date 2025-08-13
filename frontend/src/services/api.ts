import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", // Local fallback
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;

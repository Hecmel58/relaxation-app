// src/services/api.ts
import axios from "axios";

const BASE_URL = "https://relaxation-app.onrender.com"; // Render backend URL

export const api = axios.create({
    baseURL: BASE_URL,
});

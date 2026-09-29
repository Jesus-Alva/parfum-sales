import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("scentia_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("scentia_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url; // "/uploads/perfumes/xxxx.jpg"
};

// Helper para construir URL absoluta de imagen
export const imageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path; // ya es absoluta
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1")
    .replace(/\/api\/v1\/?$/, ""); // quitar /api/v1
  return `${base}${path}`;
};
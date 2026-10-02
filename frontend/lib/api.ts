import axios from "axios";
import { clearToken } from "@/lib/auth";

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
      clearToken();
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
  return data.url;
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];
  if (files.length === 1) return [await uploadImage(files[0])];

  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const { data } = await api.post("/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.files.map((f: any) => f.url);
};

export const imageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1")
    .replace(/\/api\/v1\/?$/, "");
  return `${base}${path}`;
};

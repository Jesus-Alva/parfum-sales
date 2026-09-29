export const saveToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("scentia_token", token);
  // Cookie espejo para el middleware (no HttpOnly porque la necesitamos leer en el client)
  document.cookie = `scentia_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("scentia_token");
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("scentia_token");
  document.cookie = "scentia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const isAuthenticated = () => !!getToken();
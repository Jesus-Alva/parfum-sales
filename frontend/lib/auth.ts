export const saveToken = (token: string, isAdmin: boolean = false) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("scentia_token", token);
  localStorage.setItem("scentia_is_admin", isAdmin ? "1" : "0");
  document.cookie = `scentia_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `scentia_is_admin=${isAdmin ? "1" : "0"}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("scentia_token");
};

export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("scentia_is_admin") === "1";
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("scentia_token");
  localStorage.removeItem("scentia_is_admin");
  document.cookie = "scentia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "scentia_is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const isAuthenticated = () => !!getToken();
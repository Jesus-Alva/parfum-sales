export const saveToken = (token: string) => {
  localStorage.setItem("scentia_token", token);
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("scentia_token");
};

export const clearToken = () => {
  localStorage.removeItem("scentia_token");
};

export const isAuthenticated = () => !!getToken();
import axios from "axios";

async function ping(...urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const rawUrl = config.url || "";
  const envBaseUrl = import.meta.env.VITE_API_URL || "";

  // Se a base já termina com /api e a URL também começa com /api,
  // removemos o prefixo duplicado da URL da request.
  if (envBaseUrl.endsWith("/api") && rawUrl.startsWith("/api/")) {
    config.url = rawUrl.slice(4);
  }

  const url = config.url || "";
  const isAuthRoute =
    rawUrl.includes("/api/auth/local") ||
    rawUrl.includes("/api/custom-auth/") ||
    rawUrl.includes("/api/auth/local/register") ||
    url.includes("/auth/local") ||
    url.includes("/custom-auth/") ||
    url.includes("/auth/local/register");

  if (!isAuthRoute) {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default apiClient;

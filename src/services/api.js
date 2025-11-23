import axios from "axios";

const apiClient = axios.create({
  // baseURL: "https://arquivo-do-bem-strapi-production.up.railway.app",
  baseURL: "http://localhost:1337",
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthRoute =
    url.includes("/api/auth/local") || // login padrão do Strapi
    url.includes("/api/custom-auth/") || // seu register student/professor
    url.includes("/api/auth/local/register"); // caso use o register nativo

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

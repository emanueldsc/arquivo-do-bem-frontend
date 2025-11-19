import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://arquivo-do-bem-strapi-production.up.railway.app/",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;

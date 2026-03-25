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

console.log("--------------------------------------")
console.log(import.meta);
console.log("--------------------------------------")
console.log(import.meta.env);
console.log("--------------------------------------")
console.log(import.meta.env.VITE_API_URL);
console.log("--------------------------------------")

const apiClient = axios.create({ baseURL });

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

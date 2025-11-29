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

// export const baseURL = "https://arquivo-do-bem-strapi-production.up.railway.app";
// export const baseURL = "import.meta.env.VITE_API_URL";
export const baseURL =  "http://localhost:1337";

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

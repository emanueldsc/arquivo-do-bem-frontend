import api from "./api";

export const authService = {
  async registerStudent({ username, email, password }) {
    const res = await api.post("/api/custom-auth/register-student", {
      username,
      email,
      password,
    });

    return res.data;
  },

  async registerProfessor({ username, email, password }) {
    const res = await api.post("/api/custom-auth/register-professor", {
      username,
      email,
      password,
    });

    return res.data;
  },

  async me(jwt) {
    const res = await api.get("/api/users/me?populate=role", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return { user: res.data };
  },

  async login({ identifier, password }) {
    const res = await api.post("/api/auth/local", {
      identifier,
      password,
    });

    return res.data;
  },
};

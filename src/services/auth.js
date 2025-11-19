import api from "./api";

export async function registerStudent({ username, email, password }) {
  const response = await api.post("/api/auth/local/register", {
    username,
    email,
    password,
  });

  const { jwt, user } = response.data;
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
}

export async function registerProfessor({ username, email, password }) {
  const res = await api.post("/api/auth/register-professor", {
    username,
    email,
    password,
  });

  const { jwt, user } = res.data;
  localStorage.setItem("jwt", jwt);
  return { jwt, user };
}

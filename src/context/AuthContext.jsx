import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { tokenService } from "../services/tokenService";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 🔥 Extrai role do formato que o Strapi retorna
  function getRole(u) {
    if (!u) return null;

    if (typeof u.role === "string") return u.role;
    if (typeof u.role === "number") return null;

    return u.role?.name || u.roles?.[0]?.name || null;
  }

  // 🔥 Carrega o usuário quando o app inicia
  useEffect(() => {
    async function init() {
      const token = tokenService.getToken();
      const storedUser = tokenService.getUser();

      if (!token || !storedUser) {
        setLoadingAuth(false);
        return;
      }

      setUser(storedUser);
      setIsLogged(true);

      // 🔥 Validação real no backend
      try {
        const res = await api.get("/api/users/me?populate=role");
        setUser(res.data);
        tokenService.save({ jwt: token, user: res.data });
      } catch (err) {
        // token inválido / expirado
        tokenService.clear();
        setUser(null);
        setIsLogged(false);
      }

      setLoadingAuth(false);
    }

    init();
  }, []);

  const role = getRole(user);
  const isStudent = role === "Student";
  const isProfessor = role === "Professor";

  function logout() {
    tokenService.clear();
    setUser(null);
    setIsLogged(false);
  }

  const value = useMemo(
    () => ({
      user,
      isLogged,
      loadingAuth,
      role,
      isStudent,
      isProfessor,
      logout,
      setUser,
      setIsLogged,
    }),
    [user, isLogged, loadingAuth, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

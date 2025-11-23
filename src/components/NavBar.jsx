import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { Logo } from "./Logo";
import style from "./NavBar.module.css";
import { SeachFiled } from "./SearchField";

// ✅ novo
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ novo
  const { isLogged, isProfessor, isStudent, logout, loadingAuth } = useAuth();

  if (loadingAuth) return null;

  return (
    <>
      <nav className={style.nav}>
        <section>
          <Logo />
        </section>

        <section className={style.links}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? style.active : undefined)}
          >
            Home
          </NavLink>

          <NavLink
            to="/repositorio"
            className={({ isActive }) => (isActive ? style.active : undefined)}
          >
            Repositório
          </NavLink>

          {/* ✅ só professor */}
          {isLogged && isProfessor && (
            <NavLink
              to="/professor"
              className={({ isActive }) =>
                isActive ? style.active : undefined
              }
            >
              Painel do Professor
            </NavLink>
          )}

          {/* ✅ só student */}
          {isLogged && isStudent && (
            <NavLink
              to="/aluno"
              className={({ isActive }) =>
                isActive ? style.active : undefined
              }
            >
              Painel do Aluno
            </NavLink>
          )}

          {/* ✅ login/logout */}
          {!isLogged ? (
            <button
              className={style.btnLogin}
              onClick={() => setIsModalOpen(true)}
            >
              Login
            </button>
          ) : (
            <button className={style.btnLogin} onClick={logout}>
              Logout
            </button>
          )}
        </section>

        <section>
          <SeachFiled />
        </section>
      </nav>

      {!isLogged && (
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { SeachFiled } from "./SearchField";

import { useState } from "react";
import { AuthModal } from "./AuthModal";
import style from "./NavBar.module.css";

export function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className={style.nav}>
        <section>
          <Logo />
        </section>

        <section className={style.links}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${style.active}` : undefined
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/repositorio"
            className={({ isActive }) =>
              isActive ? `${style.active}` : undefined
            }
          >
            Repositório
          </NavLink>
          <NavLink
            to="/professor"
            className={({ isActive }) =>
              isActive ? `${style.active}` : undefined
            }
          >
            Painel do Professor
          </NavLink>
          <NavLink
            to="/aluno"
            className={({ isActive }) =>
              isActive ? `${style.active}` : undefined
            }
          >
            Painel do Aluno
          </NavLink>
          <button
            className={style.btnLogin}
            onClick={() => setIsModalOpen(true)}
          >
            Login
          </button>
        </section>

        <section>
          <SeachFiled />
        </section>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

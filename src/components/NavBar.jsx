import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { SeachFiled } from "./SearchField";

import style from "./NavBar.module.css";

export function NavBar() {
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
            to="/gestao"
            className={({ isActive }) =>
              isActive ? `${style.active}` : undefined
            }
          >
            Gestão de Projetos
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
        </section>

        <section>
          <SeachFiled />
        </section>
      </nav>
    </>
  );
}

// src/components/InstitutionalCard.jsx
import { Link } from "react-router-dom";
import style from "./InstitutionalCard.module.css";

export function InstitutionalCard({ item }) {
  const {
    title,
    content,
    institutionName,
    status,
    slug,
    institutionSlug
  } = item || {};

  function stripHTML(html = "") {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  }

  const cleanText = stripHTML(content);

  return (
    <div className={style.card}>
      <header className={style.title}>
        <h1>{title || "Projeto sem título"}</h1>
        <span>{status || "ativo"}</span>
      </header>

      <p className={style.subtitle}>
        {institutionName || "Instituição não informada"}
      </p>

      <p className={style.content}>
        {cleanText || "Projeto sem descrição cadastrada no momento."}
      </p>

      <div className={style.actions}>
        <Link
          to={slug ? `/projetos/${slug}` : "#"}
          className={style.btnProject}
        >
          Ver Projeto
        </Link>

        {institutionSlug ? (
          <Link
            to={`/institutions/${institutionSlug}`} // ajuste se seu path for outro
            className={style.btnInstitution}
          >
            Instituição
          </Link>
        ) : (
          <button className={style.btnInstitution} disabled>
            Instituição
          </button>
        )}
      </div>
    </div>
  );
}

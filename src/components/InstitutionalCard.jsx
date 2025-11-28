// src/components/InstitutionalCard.jsx
import style from "./InstitutionalCard.module.css";

export function InstitutionalCard({ item }) {
  const {
    title,
    content,
    institutionName,
    status,
  } = item || {};

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
        {content || "Projeto sem descrição cadastrada no momento."}
      </p>

      <div className={style.actions}>
        <button className={style.btnProject}>Ver Projeto</button>
        <button className={style.btnInstitution}>Instituição</button>
      </div>
    </div>
  );
}

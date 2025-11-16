import style from "./InstitutionalCard.module.css";

export function InstitutionalCard({ item }) {
  return (
    <div className={style.card}>
      <header className={style.title}>
        <h1>Plataforma de titulo</h1>
        <span>ativo</span>
      </header>
      <p className={style.subtitle}>Instituto exemplo</p>
      <p className={style.content}>Um sistema para acompanhar indicadores de saúde em tempo real...</p>
      <div className={style.actions}>
        <button className={style.btnProject}>Ver Projeto</button>
        <button className={style.btnInstitution}>Instituição</button>
      </div>
    </div>
  );
}

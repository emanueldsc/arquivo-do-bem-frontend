import style from "./Logo.module.css";
import logoUrl from "../assets/logo.png";

export function Logo() {
  return (
    <div className={style.container}>
      <img className={style.logo} src={logoUrl} alt="Logo" />
      <div>
        <h1 className={style.arquivo}>Arquivo</h1>
        <h1 className={style.do}>do</h1>
        <h1 className={style.bem}>Bem</h1>
      </div>
    </div>
  );
}

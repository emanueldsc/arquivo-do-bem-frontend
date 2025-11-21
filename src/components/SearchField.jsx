import style from "./SearchField.module.css";

export function SeachFiled() {
  return (
    <div className={style.container}>
      <input
        className={`w3-input w3-border  ${style.fieldText}`}
        type="text"
        name="searchfield"
        id="searchfield"
        placeholder="Buscar Projetos, autores..."
      />
      <button className={style.submit}>Buscar</button>
    </div>
  );
}

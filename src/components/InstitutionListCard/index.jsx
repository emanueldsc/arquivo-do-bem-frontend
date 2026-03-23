import { Link } from "react-router-dom";
import style from "./index.module.css";

export function InstitutionListCard({ item }) {
  // Garantir que a descrição seja texto e limitar tamanho
  let rawDesc = "Descrição indisponível.";
  
  if (item.description) {
    if (typeof item.description === 'string') {
      rawDesc = item.description;
    } else if (Array.isArray(item.description)) {
      // Se for RichText do Strapi v5, extrair os filhos de texto
      rawDesc = item.description.map(p => 
        p.children ? p.children.map(c => c.text).join(" ") : ""
      ).join(" ");
    }
  }

  const shortDesc = rawDesc.length > 180 ? rawDesc.substring(0, 180) + "..." : rawDesc;

  return (
    <div className={`w3-card-4 w3-round-large ${style.cardContainer}`}>
      <div className={style.imageWrapper}>
        {item.logo ? (
          <img src={item.logo} alt={`Logo de ${item.name}`} className={style.logo} />
        ) : (
          <div className={style.placeholderLogo}>
            <span>Sem imagem</span>
          </div>
        )}
      </div>
      <div className={style.contentWrapper}>
        <div className={style.textWrapper}>
          <h3 className={style.title}>{item.name}</h3>
          <p className={style.description}>{shortDesc}</p>
        </div>
        <div className={style.actionsWrapper}>
          <Link to={`/institutions/${item.slug}`} className={`w3-button w3-round-large ${style.btn}`}>
            Ver Instituição
          </Link>
        </div>
      </div>
    </div>
  );
}

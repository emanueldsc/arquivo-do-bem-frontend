import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { InstitutionListCard } from "../../components/InstitutionListCard";
import { institutionService } from "../../services/institutionService";
import style from "./index.module.css";

export function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoading(true);
        const { data, meta } = await institutionService.getInstitutionsPaginated(page, pageSize);
        setInstitutions(data);
        if (meta?.pagination) {
          setPageCount(meta.pagination.pageCount || 1);
          setTotal(meta.pagination.total || 0);
        }
      } catch (err) {
        console.error("Erro ao carregar instituições:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInstitutions();
  }, [page, pageSize]);

  return (
    <div className={style.pageContainer}>
      <header className={style.header}>
        <div className="w3-content">
          <h1>Instituições Parceiras</h1>
          <p>
            Conheça as <b>{total}</b> instituições cadastradas na nossa rede e
            descubra mais sobre suas atividades!
          </p>
        </div>
      </header>

      <main className={`w3-content ${style.mainContent}`}>
        {loading ? (
          <div className="w3-center w3-padding-64">
            <p>Carregando instituições...</p>
          </div>
        ) : institutions.length === 0 ? (
          <div className="w3-center w3-padding-64">
            <p>Nenhuma instituição cadastrada até o momento.</p>
          </div>
        ) : (
          <div className={style.listWrapper}>
            {institutions.map((inst) => (
              <InstitutionListCard key={inst.id} item={inst} />
            ))}
          </div>
        )}

        {/* COMPONENTE DE PAGINAÇÃO */}
        {pageCount > 1 && (
          <div className={`w3-bar w3-center ${style.pagination}`}>
            <button
              className="w3-button w3-border"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              &laquo; Anterior
            </button>
            <span className={style.pageInfo}>
              Página {page} de {pageCount}
            </span>
            <button
              className="w3-button w3-border"
              disabled={page === pageCount}
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            >
              Próxima &raquo;
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

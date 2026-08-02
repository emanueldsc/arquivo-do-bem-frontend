import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

import style from "./index.module.css";

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function ProjectPage() {
  const { slug } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/api/projects?filters[slug][$eq]=${encodeURIComponent(
            slug
          )}&populate[institution][fields][0]=name&populate[institution][fields][1]=address&populate[leader][fields][0]=username&populate[leader][fields][1]=email&populate[semesters][fields][0]=name&populate[semesters][fields][1]=year&populate[semesters][fields][2]=impacted_lives&populate[publications][fields][0]=title&populate[publications][fields][1]=content&populate[publications][fields][2]=state&populate[publications][fields][3]=publishedAt`
        );

        const data = res.data?.data?.[0];

        if (!data) {
          setError("Projeto não encontrado.");
          return;
        }

        const attrs = data || {};
        const instData = attrs.institution || null;
        const leaderData = attrs.leader?.data?.attributes || attrs.leader || null;

        const semesters = (attrs.semesters || []).map((item) => ({
          id: item.id,
          ...(item.attributes || item),
          impactedLives:
            item.attributes?.impacted_lives ??
            item.attributes?.impactedLives ??
            item.impacted_lives ??
            item.impactedLives ??
            0,
        }));

        const publications = (attrs.publications || []).map((item) => ({
          id: item.id,
          documentId: item.documentId || item.id,
          ...(item.attributes || item),
        }));

        setProject({
          id: data.id,
          documentId: data.documentId,
          name: attrs.name,
          description: attrs.description,
          isActive: attrs.is_active,
          institution: instData
            ? {
                id: instData.id,
                documentId: instData.documentId,
                name: instData.name,
                address: instData.address,
              }
            : null,
          leader: leaderData
            ? {
                id: leaderData.id,
                documentId: leaderData.documentId,
                username: leaderData.username,
                email: leaderData.email,
              }
            : null,
          semesters,
          publications,
        });
      } catch (err) {
        console.error("Erro ao buscar projeto:", err?.response?.data || err);
        setError("Ocorreu um erro ao carregar o projeto.");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className={style.projectPage}>
        <p>Carregando projeto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.projectPage}>
        <p>{error}</p>
        <Link to="/" className={style.backLink}>
          ← Voltar para a página inicial
        </Link>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className={style.pageLayout}>
      <div className={style.mainContent}>
        <div className={style.projectPage}>
        <header className={style.header}>
          <div>
            <h1>{project.name}</h1>
            {project.institution && (
              <p className={style.institution}>
                Instituição:{" "}
                <strong>{project.institution.name || "Não informada"}</strong>
              </p>
            )}
          </div>

          <Link to="/" className={style.backLink}>
            ← Voltar
          </Link>
        </header>

        {/* Descrição rica do projeto */}
        <section className={style.description}>
          {project.description ? (
            <div
              className={style.richText}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          ) : (
            <p>Projeto sem descrição cadastrada no momento.</p>
          )}
        </section>

        {/* Liderança */}
        <section className={style.block}>
          <h2>Liderança</h2>
          {project.leader ? (
            <p>
              Líder atual: <strong>{project.leader.username || project.leader.email || "Não informado"}</strong>
            </p>
          ) : (
            <p>Este projeto ainda não possui líder definido.</p>
          )}
        </section>

        {/* Semestres vinculados */}
        {project.semesters?.length > 0 && (
          <section className={style.block}>
            <h2>Semestres</h2>
            <p>
              Total de vidas impactadas:{" "}
              <strong>
                {project.semesters.reduce(
                  (sum, sem) =>
                    sum + Number(sem.impacted_lives ?? sem.impactedLives ?? 0),
                  0
                )}
              </strong>
            </p>
            <ul>
              {project.semesters.map((sem) => (
                <li key={sem.id}>
                  <strong>{sem.name || sem.title || "Sem nome"}</strong>{" "}
                  {sem.year && <>• {sem.year}</>}
                  {typeof (sem.impacted_lives ?? sem.impactedLives) !== "undefined" && (
                    <span>
                      {' '}
                      • Vidas impactadas: {Number(sem.impacted_lives ?? sem.impactedLives ?? 0)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>
      </div>

      {/* Coluna Direita: Publicações Aprovadas */}
      <aside className={style.publicationsSidebar}>
        <h3 className={style.sidebarTitle}>Publicações dos Alunos</h3>
        
        {!project?.publications || project.publications.filter((publication) => publication.state === "PUBLISHED").length === 0 ? (
          <div className={style.emptyState}>
            <span>Não há publicações</span>
          </div>
        ) : (
          <div className={style.publicationsList}>
            {project.publications
              .filter((pub) => pub.state === "PUBLISHED")
              .map((pub) => {
              const data = pub.attributes || pub;

              return (
                <div key={pub.id} className={style.publicationCard}>
                  <h4>{data.title}</h4>
                  {data.publishedAt ? (
                    <small className={style.pubAuthor}>
                      Publicada em: {new Date(data.publishedAt).toLocaleDateString()}
                    </small>
                  ) : null}
                  <div className={style.pubContent}>
                    {stripHtml(data.content)}
                  </div>
                  <Link to={`/publicacao/${pub.documentId || pub.id}`} className={style.readMoreBtn}>
                    Ler publicação
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

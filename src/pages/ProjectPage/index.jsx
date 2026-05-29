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

  const [publications, setPublications] = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/api/projects?filters[slug][$eq]=${encodeURIComponent(
            slug
          )}&populate[institution][fields][0]=name&populate[institution][fields][1]=address&populate[semesters][fields][0]=name&populate[semesters][fields][1]=year&populate[publications][fields][0]=title&populate[publications][fields][1]=publishedAt`
        );

        const data = res.data?.data?.[0];

        if (!data) {
          setError("Projeto não encontrado.");
          return;
        }

        const attrs = data || {};
        const instData = attrs.institution || null;

        const semesters = (attrs.semesters || []).map((item) => ({
          id: item.id,
          ...item.attributes,
        }));

        const publications = (attrs.publications || []).map((item) => ({
          id: item.id,
          ...item.attributes,
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

  useEffect(() => {
    async function fetchProjectPublications() {
      try {
        setLoadingPubs(true);
        const res = await api.get(
          `/api/publications?filters[project][slug][$eq]=${encodeURIComponent(
            slug
          )}&filters[state][$eq]=PUBLISHED&populate=student_author&sort=createdAt:desc`
        );
        setPublications(res.data?.data || []);
      } catch (err) {
        console.error("Erro ao buscar publicações do projeto:", err);
      } finally {
        setLoadingPubs(false);
      }
    }

    if (slug) {
      fetchProjectPublications();
    }
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

        {/* Semestres vinculados */}
        {project.semesters?.length > 0 && (
          <section className={style.block}>
            <h2>Semestres</h2>
            <ul>
              {project.semesters.map((sem) => (
                <li key={sem.id}>
                  {sem.name || sem.title || "Sem nome"}{" "}
                  {sem.year && <>• {sem.year}</>}
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
        
        {loadingPubs ? (
          <p>Carregando publicações...</p>
        ) : publications.length === 0 ? (
          <div className={style.emptyState}>
            <span>Não há publicações</span>
          </div>
        ) : (
          <div className={style.publicationsList}>
            {publications.map((pub) => {
              const data = pub.attributes || pub;
              const authorData = data.student_author?.data?.attributes || data.student_author || {};
              
              return (
                <div key={pub.id} className={style.publicationCard}>
                  <h4>{data.title}</h4>
                  <small className={style.pubAuthor}>
                    Por: {authorData.name || authorData.username || "Aluno"}
                  </small>
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

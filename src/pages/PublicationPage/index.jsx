import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

import style from "./index.module.css";

export function PublicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPublication() {
      try {
        setLoading(true);
        setError("");

        // Trazendo a publicação com dados de projeto e aluno vinculados
        const res = await api.get(
          `/api/publications/${id}?populate=project&populate=student_author`
        );

        const data = res.data?.data;

        if (!data) {
          setError("Publicação não encontrada.");
          return;
        }

        const attrs = data.attributes || data;
        const projectData = attrs.project?.data?.attributes || attrs.project || null;
        const authorData = attrs.student_author?.data?.attributes || attrs.student_author || null;

        setPublication({
          id: data.id || data.documentId,
          title: attrs.title,
          content: attrs.content,
          createdAt: attrs.createdAt || attrs.publishedAt,
          projectName: projectData?.name || "Projeto não informado",
          projectSlug: projectData?.slug || null,
          authorName: authorData?.name || authorData?.username || "Aluno",
        });
      } catch (err) {
        console.error("Erro ao buscar publicação:", err?.response?.data || err);
        setError("Ocorreu um erro ao carregar a publicação.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPublication();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={style.pageLayout}>
        <p>Carregando publicação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.pageLayout}>
        <p className={style.error}>{error}</p>
        <button onClick={() => navigate(-1)} className={style.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          ← Voltar
        </button>
      </div>
    );
  }

  if (!publication) {
    return null;
  }

  return (
    <div className={style.pageLayout}>
      <div className={style.mainContent}>
        <header className={style.header}>
          <div>
            <h1>{publication.title}</h1>
            <p className={style.meta}>
              Publicado por <strong>{publication.authorName}</strong> em {new Date(publication.createdAt).toLocaleDateString("pt-BR")}
            </p>
            {publication.projectName && (
              <p className={style.metaProject}>
                Vinculado ao projeto:{" "}
                {publication.projectSlug ? (
                  <Link to={`/projetos/${publication.projectSlug}`}>
                    <strong>{publication.projectName}</strong>
                  </Link>
                ) : (
                  <strong>{publication.projectName}</strong>
                )}
              </p>
            )}
          </div>
          
          <button onClick={() => navigate(-1)} className={style.backLink} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0}}>
            ← Voltar
          </button>
        </header>

        <section className={style.content}>
          <div
            className={style.richText}
            dangerouslySetInnerHTML={{ __html: publication.content }}
          />
        </section>
      </div>
    </div>
  );
}
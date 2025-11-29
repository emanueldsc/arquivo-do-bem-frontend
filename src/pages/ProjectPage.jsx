// src/pages/ProjectPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

import style from "./ProjectPage.module.css";

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
    <>
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

        {/* Publicações vinculadas */}
        {project.publications?.length > 0 && (
          <section className={style.block}>
            <h2>Publicações</h2>
            <ul>
              {project.publications.map((pub) => (
                <li key={pub.id}>
                  {pub.title || "Sem título"}{" "}
                  {pub.publishedAt && (
                    <>
                      • {new Date(pub.publishedAt).toLocaleDateString("pt-BR")}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

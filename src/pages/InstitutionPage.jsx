// src/pages/InstitutionPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

import { InstitutionalCard } from "../components/InstitutionalCard"; // ⬅ importa o card

import style from "./InstitutionPage.module.css";

export function InstitutionPage() {
  const { slug } = useParams();

  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInstitution() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/api/institutions?filters[slug][$eq]=${encodeURIComponent(
            slug
          )}&populate[projects][populate]=*`
        );

        const data = res.data?.data?.[0];

        if (!data) {
          setError("Instituição não encontrada.");
          return;
        }

        const attrs = data.attributes || data || {};

        const rawProjects = attrs.projects?.data || attrs.projects || [];

        const projects = rawProjects.map((item) => ({
          id: item.id,
          ...(item.attributes || item),
        }));

        setInstitution({
          id: data.id,
          documentId: data.documentId,
          name: attrs.name,
          slug: attrs.slug,
          description: attrs.description,
          address: attrs.address,
          projects,
        });
      } catch (err) {
        console.error("Erro ao buscar instituição:", err?.response?.data || err);
        setError("Ocorreu um erro ao carregar a instituição.");
      } finally {
        setLoading(false);
      }
    }

    fetchInstitution();
  }, [slug]);

  if (loading) {
    return (
      <div className={style.institutionPage}>
        <p>Carregando instituição...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.institutionPage}>
        <p>{error}</p>
        <Link to="/" className={style.backLink}>
          ← Voltar para a página inicial
        </Link>
      </div>
    );
  }

  if (!institution) return null;

  return (
    <div className={style.institutionPage}>
      {/* HEADER */}
      <header className={style.header}>
        <div>
          <h1>{institution.name}</h1>
          {institution.address && (
            <p className={style.address}>
              Endereço: <strong>{institution.address}</strong>
            </p>
          )}
        </div>

        <Link to="/" className={style.backLink}>
          ← Voltar
        </Link>
      </header>

      {/* DESCRIÇÃO RICA DA INSTITUIÇÃO */}
      <section className={style.description}>
        {institution.description ? (
          <div
            className={style.richText}
            dangerouslySetInnerHTML={{ __html: institution.description }}
          />
        ) : (
          <p>Instituição sem descrição cadastrada no momento.</p>
        )}
      </section>

      {/* PROJETOS ASSOCIADOS – SEÇÃO SEPARADA */}
      <section className={style.projectsSection}>
        <h2>Projetos da instituição</h2>

        {!institution.projects?.length && (
          <p>Esta instituição ainda não possui projetos cadastrados.</p>
        )}

        {institution.projects?.length > 0 && (
          <div className={style.projectsList}>
            {institution.projects.map((project) => (
              <InstitutionalCard
                key={project.id}
                item={{
                  id: project.id,
                  slug: project.slug,
                  title: project.name,
                  content: project.description,
                  institutionId: institution.documentId || institution.id,
                  institutionName: institution.name,
                  institutionSlug: institution.slug,
                  status:
                    project.is_active === false ? "inativo" : "ativo",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

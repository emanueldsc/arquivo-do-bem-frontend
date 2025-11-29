// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { InstitutionalCard } from "../components/InstitutionalCard";
import api from "../services/api";

import style from "./Home.module.css";

export function Home() {
  const [projects, setProjects] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [uploads, setUploads] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingUploads, setLoadingUploads] = useState(true);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  // =========================
  // Fetch de dados
  // =========================

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoadingProjects(true);

        const res = await api.get(
          "/api/projects?sort[0]=createdAt:desc&populate[institution][fields][0]=name&populate[institution][fields][1]=slug"
        );

        const list = res.data?.data || [];

        const formatted = list.map((item) => {
          const base = item.attributes || item;
          const docId = item.documentId || item.id;

          const instData = base.institution || null;
          let institutionName = "";
          let institutionId = "";
          let institutionSlug = "";
          if (instData) {
            institutionName = instData.name || "(sem instituição)";
            institutionId = instData?.documentId || instData?.id || "";
            institutionSlug = instData?.slug || "";
          }

          return {
            id: docId,
            slug: base.slug,
            title: base.name || "(sem nome)", // título do card
            content:
              base.description ||
              "Projeto sem descrição cadastrada no momento.",
            institutionId,
            institutionName,
            institutionSlug,
            status: base.is_active === false ? "inativo" : "ativo",
          };
        });

        setProjects(formatted);
      } catch (err) {
        console.error("Erro ao buscar projetos:", err?.response?.data || err);
      } finally {
        setLoadingProjects(false);
      }
    }

    async function fetchInstitutions() {
      try {
        setLoadingInstitutions(true);

        const res = await api.get(
          "/api/institutions?sort[0]=name:asc&fields[0]=name"
        );

        const list = res.data?.data || [];

        const formatted = list.map((item) => {
          const base = item.attributes || item;
          const docId = item.documentId || item.id;

          return {
            id: docId,
            name: base.name || "(sem nome)",
          };
        });

        setInstitutions(formatted);
      } catch (err) {
        console.error(
          "Erro ao buscar instituições:",
          err?.response?.data || err
        );
      } finally {
        setLoadingInstitutions(false);
      }
    }

    async function fetchUploads() {
      try {
        setLoadingUploads(true);

        const res = await api.get("/api/upload/files");
        const list = Array.isArray(res.data) ? res.data : [];

        // Ordena por data e pega só os 5 mais recentes
        const formatted = list
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((file) => ({
            id: file.id,
            name: file.name,
            createdAt: file.createdAt,
          }));

        setUploads(formatted);
      } catch (err) {
        console.error("Erro ao buscar uploads:", err?.response?.data || err);
      } finally {
        setLoadingUploads(false);
      }
    }

    fetchProjects();
    fetchInstitutions();
    fetchUploads();
  }, []);

  // =========================
  // Filtro de projetos
  // =========================

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesInstitution =
        !selectedInstitutionId || proj.institutionId === selectedInstitutionId;

      const search = projectSearch.trim().toLowerCase();
      const matchesSearch =
        !search ||
        proj.title.toLowerCase().includes(search) ||
        (proj.content || "").toLowerCase().includes(search) ||
        (proj.institutionName || "").toLowerCase().includes(search);

      return matchesInstitution && matchesSearch;
    });
  }, [projects, selectedInstitutionId, projectSearch]);

  // =========================
  // Helpers
  // =========================

  function formatRelativeTime(dateString) {
    if (!dateString) return "";
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "hoje";
    if (diffDays === 1) return "1 dia";
    if (diffDays < 7) return `${diffDays} dias`;
    const weeks = Math.floor(diffDays / 7);
    if (weeks === 1) return "1 semana";
    if (weeks < 4) return `${weeks} semanas`;
    return created.toLocaleDateString("pt-BR");
  }

  const institutionsCount = institutions.length;
  const projectsCount = projects.length;

  return (
    <div className={style.home}>
      {/* HEADER */}
      <section className={style.header}>
        <h2>Projetos em destaque</h2>
        <p>
          Instituições atendidas {institutionsCount} • Projetos cadastrados{" "}
          {projectsCount}
        </p>
      </section>

      {/* LISTA DE PROJETOS */}
      <section className={style.content}>
        {loadingProjects && <p>Carregando projetos...</p>}

        {!loadingProjects && filteredProjects.length === 0 && (
          <p>Nenhum projeto encontrado com os filtros atuais.</p>
        )}

        {!loadingProjects &&
          filteredProjects.map((item) => (
            <InstitutionalCard key={item.id} item={item} />
          ))}
      </section>

      {/* SIDEBAR */}
      <section className={style.sidebar}>
        {/* FILTROS */}
        <div className={style.filter}>
          <h4>Filtros</h4>
          <form>
            <div>
              <label htmlFor="filter-institution">Instituições</label>
              <select
                id="filter-institution"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
              >
                <option value="">Todas as instituições</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-project-search">Projetos</label>
              <input
                id="filter-project-search"
                type="text"
                placeholder="Buscar por nome, descrição..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* ÚLTIMOS UPLOADS */}
        <div className={style.lastUpload}>
          <h4>Últimos uploads</h4>

          {loadingUploads && <p>Carregando...</p>}

          {!loadingUploads && uploads.length === 0 && (
            <p>Nenhum arquivo enviado ainda.</p>
          )}

          {!loadingUploads && uploads.length > 0 && (
            <>
              <ul>
                {uploads.map((file) => (
                  <li key={file.id}>
                    {file.name} • {formatRelativeTime(file.createdAt)}
                  </li>
                ))}
              </ul>

              <div className={style.repoLinkWrapper}>
                <Link to="/repositorio">Ver todos os arquivos</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

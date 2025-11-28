import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import style from "./ProjectManager.module.css";

export function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function fetchProjects() {
    try {
      setLoading(true);

      // populate=institution pra trazer o nome da instituição vinculada
      const res = await api.get(
        "/api/projects?sort=createdAt:desc&populate=institution"
      );
      const list = res.data?.data || [];

      const formatted = list.map((item) => {
        const base = item.attributes || item;
        const docId = item.documentId || item.id;

        // instituição pode vir como relation populada
        const instData = base.institution?.data || base.institution || null;
        const instAttrs = instData?.attributes || instData || {};
        const institutionName = instAttrs?.name || "(sem instituição)";

        return {
          id: docId,
          name: base.name || "(sem nome)",
          institutionName,
          isActive:
            typeof base.is_active === "boolean" ? base.is_active : true,
          createdAt: base.createdAt || null,
        };
      });

      setProjects(formatted);
    } catch (err) {
      console.error("Erro ao buscar projetos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function handleCreateClick() {
    navigate("/professor/projetos/novo");
  }

  function handleEditClick(id) {
    navigate(`/professor/projetos/${id}/editar`);
  }

  async function handleDeleteClick(id) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    try {
      await api.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error("Erro ao excluir projeto:", err);
      alert("Erro ao excluir. Verifique o console.");
    }
  }

  return (
    <section className="container tab-container">
      <section className={style.header}>
        <h1>Gestão de Projetos</h1>

        <p>Crie, edite ou exclua projetos (área administrativa).</p>

        <button className="btn btn-primary" onClick={handleCreateClick}>
          + Criar projeto
        </button>

        <h2>Lista de projetos</h2>
      </section>

      {/* Tabela */}
      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Instituição</th>
              <th>Status</th>
              <th>Data de criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && projects.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Nenhum projeto cadastrado.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Carregando...
                </td>
              </tr>
            )}

            {projects.map((proj) => (
              <tr key={proj.id}>
                <td>{proj.name}</td>
                <td>{proj.institutionName}</td>
                <td>{proj.isActive ? "Ativo" : "Inativo"}</td>
                <td>
                  {proj.createdAt
                    ? new Date(proj.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
                </td>

                <td className={style.btnContainer}>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEditClick(proj.id)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-remove"
                    onClick={() => handleDeleteClick(proj.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

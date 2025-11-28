import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import style from "./ProjectManager.module.css";

export function InstitutionsManager() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function fetchInstitutions() {
    try {
      setLoading(true);
      const res = await api.get("/api/institutions?sort=name:asc");
      const list = res.data?.data || [];

      const formatted = list.map((item) => ({
        id: item.documentId,
        name: item.name || item.attributes?.name,
        address:
          item.address ||
          item.attributes?.address ||
          "(sem endereço cadastrado)",
        createdAt:
          item.createdAt ||
          item.attributes?.createdAt ||
          new Date().toISOString(),
      }));

      setInstitutions(formatted);
    } catch (err) {
      console.error("Erro ao buscar instituições:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInstitutions();
  }, []);

  function handleCreateClick() {
    navigate("/professor/instituicoes/nova");
  }

  function handleEditClick(id) {
    navigate(`/professor/instituicoes/${id}/editar`);
  }

  async function handleDeleteClick(id) {
    if (!confirm("Tem certeza que deseja excluir esta instituição?")) return;

    try {
      await api.delete(`/api/institutions/${id}`);
      fetchInstitutions();
    } catch (err) {
      console.error("Erro ao excluir instituição:", err);
      alert("Erro ao excluir. Verifique o console.");
    }
  }

  return (
    <section className="container tab-container">
      <section className={style.header}>
        <h1>Gestão de Instituições</h1>

        <p>Crie, edite ou exclua instituições (área administrativa).</p>

        <button className="btn btn-primary" onClick={handleCreateClick}>
          + Criar instituição
        </button>

        <h2>Lista de instituições</h2>
      </section>

      {/* Tabela */}
      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Data de criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && institutions.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Nenhuma instituição cadastrada.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Carregando...
                </td>
              </tr>
            )}

            {institutions.map((inst) => (
              <tr key={inst.id}>
                <td>{inst.name}</td>
                <td>{inst.address}</td>
                <td>
                  {inst.createdAt
                    ? new Date(inst.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
                </td>

                <td className={style.btnContainer}>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEditClick(inst.id)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-remove"
                    onClick={() => handleDeleteClick(inst.id)}
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

import { useEffect, useState } from "react";
import api from "../services/api";
import layoutStyle from "./ProjectManager.module.css";
import formStyle from "./SemestersManager.module.css";

export function SemestersManager() {
  const [semesters, setSemesters] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingSemester, setEditingSemester] = useState(null);

  // formulário
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [gradeFormulaDescription, setGradeFormulaDescription] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function resetForm() {
    setEditingSemester(null);
    setName("");
    setYear("");
    setStartDate("");
    setEndDate("");
    setProjectId("");
    setGradeFormulaDescription("");
  }

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  async function fetchSemesters() {
    try {
      setLoading(true);
      resetMessages();

      const res = await api.get(
        "/api/semesters?sort=start_date:desc&populate=project"
      );

      const list = res.data?.data || [];

      const formatted = list.map((item) => {
        const base = item.attributes || item;
        const docId = item.documentId || item.id;

        const projectData = base.project?.data || base.project || null;
        const projectAttrs = projectData?.attributes || projectData || {};
        const projectName = projectAttrs?.name || "(sem projeto)";

        return {
          id: docId,
          name: base.name || "",
          year: base.year || "",
          startDate: base.start_date || "",
          endDate: base.end_date || "",
          projectName,
          projectDocId: projectData?.documentId || projectData?.id || "",
          gradeFormulaDescription: base.grade_formula_description || "",
        };
      });

      setSemesters(formatted);
    } catch (err) {
      console.error("Erro ao buscar semestres:", err?.response?.data || err);
      setError("Não foi possível carregar os semestres.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const res = await api.get("/api/projects?sort=name:asc");
      const list = res.data?.data || [];

      const formatted = list.map((item) => {
        const base = item.attributes || item;
        const docId = item.documentId || item.id;

        return {
          id: docId,
          name: base.name || "(sem nome)",
        };
      });

      setProjects(formatted);
    } catch (err) {
      console.error("Erro ao buscar projetos:", err?.response?.data || err);
    }
  }

  useEffect(() => {
    fetchSemesters();
    fetchProjects();
  }, []);

  function handleEditClick(semester) {
    resetMessages();
    setEditingSemester(semester);

    setName(semester.name || "");
    setYear(semester.year || "");
    setStartDate(semester.startDate || "");
    setEndDate(semester.endDate || "");
    setProjectId(semester.projectDocId || "");
    setGradeFormulaDescription(semester.gradeFormulaDescription || "");
  }

  async function handleDeleteClick(id) {
    if (!confirm("Tem certeza que deseja excluir este semestre?")) return;

    try {
      resetMessages();
      await api.delete(`/api/semesters/${id}`);
      setSuccess("Semestre excluído com sucesso.");
      fetchSemesters();
      if (editingSemester?.id === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Erro ao excluir semestre:", err?.response?.data || err);
      setError("Erro ao excluir semestre. Verifique o console.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    resetMessages();
    setSaving(true);

    try {
      const payload = {
        data: {
          name,
          year: year ? Number(year) : null,
          start_date: startDate || null,
          end_date: endDate || null,
          grade_formula_description: gradeFormulaDescription || null,
          grade_formula: null,
          grade_formula_language: "JAVASCRIPT",
          project: projectId || null,
        },
      };

      let res;
      if (editingSemester) {
        res = await api.put(`/api/semesters/${editingSemester.id}`, payload);
        setSuccess("Semestre atualizado com sucesso.");
      } else {
        res = await api.post("/api/semesters", payload);
        setSuccess("Semestre criado com sucesso.");
      }

      await fetchSemesters();
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar semestre:", err?.response?.data || err);
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Não foi possível salvar o semestre."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    resetMessages();
    resetForm();
  }

  return (
    <section className="container tab-container">
      {/* HEADER */}
      <section className={layoutStyle.header}>
        <h1>Gestão de Semestres</h1>

        <p>Crie e edite semestres para organizar projetos e repositório.</p>

        <h2>Lista de semestres</h2>
      </section>

      {/* TABELA */}
      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && semesters.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Nenhum semestre cadastrado.
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

            {semesters.map((sem) => (
              <tr key={sem.id}>
                <td>{sem.name}</td>
                <td>{sem.year || "-"}</td>
                <td>
                  {sem.startDate || sem.endDate
                    ? `${sem.startDate || "?"} até ${sem.endDate || "?"}`
                    : "-"}
                </td>
                <td className={layoutStyle.btnContainer}>
                  <button
                    className="btn btn-edit"
                    type="button"
                    onClick={() => handleEditClick(sem)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-remove"
                    type="button"
                    onClick={() => handleDeleteClick(sem.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FORMULÁRIO */}
      <section className={formStyle.formSection}>
        <h2 className={formStyle.formTitle}>
          {editingSemester ? "Editar semestre" : "Novo semestre"}
        </h2>
        <p className={formStyle.formSubtitle}>
          Defina nome e período do semestre. As alterações afetam o repositório
          e os projetos relacionados.
        </p>

        <form onSubmit={handleSubmit} className={formStyle.form}>
          {/* Nome */}
          <div className={formStyle.field}>
            <label htmlFor="semester-name" className={formStyle.label}>
              Nome (ex: 2025.1) *
            </label>
            <input
              id="semester-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="2025.1"
              className={formStyle.input}
            />
          </div>

          {/* Ano */}
          <div className={formStyle.field}>
            <label htmlFor="semester-year" className={formStyle.label}>
              Ano
            </label>
            <input
              id="semester-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025"
              className={formStyle.input}
            />
          </div>

          {/* Início */}
          <div className={formStyle.field}>
            <label htmlFor="semester-start" className={formStyle.label}>
              Início
            </label>
            <input
              id="semester-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={formStyle.input}
            />
          </div>

          {/* Fim */}
          <div className={formStyle.field}>
            <label htmlFor="semester-end" className={formStyle.label}>
              Fim
            </label>
            <input
              id="semester-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={formStyle.input}
            />
          </div>

          {/* Botões (à direita) */}
          <div className={formStyle.actionsRow}>
            {editingSemester && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={formStyle.secondaryButton}
                disabled={saving}
              >
                Cancelar edição
              </button>
            )}

            <button
              type="submit"
              className={formStyle.primaryButton}
              disabled={saving || !name.trim()}
            >
              {saving
                ? editingSemester
                  ? "Salvando..."
                  : "Criando..."
                : editingSemester
                ? "Salvar alterações"
                : "Criar semestre"}
            </button>
          </div>

          {/* Mensagens embaixo ocupando a linha toda */}
          <div className={formStyle.messagesRow}>
            {error && <p className={formStyle.messageError}>{error}</p>}
            {success && <p className={formStyle.messageSuccess}>{success}</p>}
          </div>
        </form>
      </section>
    </section>
  );
}

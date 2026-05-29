import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectEditor } from "../../components/ProjectEditor";
import api from "../../services/api";
import style from "../InstitutionEditorPage/index.module.css";

export function ProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id && id !== "novo");

  const [project, setProject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);

        // Especificando os campos exatos de institution e users para evitar erros de Strict Validation (400) e Internal Server (500)
        const res = await api.get(`/api/projects/${id}?populate[institution][fields][0]=name&populate[users][fields][0]=username&populate[users][fields][1]=email`);
        const data = res.data?.data;

        if (!data) {
          throw new Error("Projeto não encontrado.");
        }

        const base = data.attributes || data;
        const docId = data.documentId || data.id;
        
        const institutionData = base.institution?.data || base.institution || null;
        const usersData = base.users?.data || base.users || [];

        setProject({
          documentId: docId,
          name: base.name || "",
          description: base.description || "",
          is_active: typeof base.is_active === "boolean" ? base.is_active : true,
          institutionId: institutionData?.documentId || institutionData?.id || "",
          maxStudents: base.max_students ?? base.maxStudents ?? 10,
        });

        setStudents(
          usersData.map((u) => {
            const uAttrs = u.attributes || u;
            return {
              id: u.id,
              username: uAttrs.username || "Sem nome",
              email: uAttrs.email || "",
            };
          })
        );
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error?.message ||
            err?.message ||
            "Não foi possível carregar o projeto."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, isEditMode]);

  function handleSuccess(saved) {
    navigate("/professor", { state: { activeTab: "projects" } });
  }

  function handleCancel() {
    navigate("/professor", { state: { activeTab: "projects" } });
  }

  async function handleUnlinkStudent(studentId, studentName) {
    if (!confirm(`Tem certeza que deseja desvincular o aluno(a) ${studentName} deste projeto?`)) return;

    try {
      // A desvinculação ocorre removendo o ID do projeto do registro do usuário
      await api.put(`/api/users/${studentId}`, {
        projects: []
      });

      // Remove o aluno da lista na tela sem precisar recarregar a página
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      alert("Aluno desvinculado com sucesso.");
    } catch (err) {
      console.error("Erro ao desvincular aluno:", err);
      alert("Erro ao tentar desvincular aluno. Verifique se o seu usuário possui permissão de edição.");
    }
  }

  const shouldShowEditor =
    !loading && !error && (!isEditMode || (isEditMode && project));

  return (
    <div className={style.page}>
      <header className={style.pageHeader}>
        <button className={style.backButton} onClick={handleCancel}>
          ← Voltar
        </button>

        <div>
          <h1 className={style.title}>
            {isEditMode ? "Editar projeto" : "Novo projeto"}
          </h1>
          <p className={style.subtitle}>
            Preencha os dados do projeto e salve para atualizar o portal.
          </p>
        </div>
      </header>

      <main className={style.pageContent}>
        {loading && <p>Carregando...</p>}
        {error && <p className={style.error}>{error}</p>}

        {shouldShowEditor && (
          <>
            <ProjectEditor
              key={project?.documentId || (isEditMode ? id : "new")}
              project={project}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />

            {isEditMode && (
              <section style={{ marginTop: '40px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e2e2' }}>
                <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px', color: '#222' }}>Alunos Vinculados</h2>
                {students.length === 0 ? (
                  <p style={{ color: '#666' }}>Nenhum aluno está vinculado a este projeto no momento.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {students.map((student) => (
                      <li key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <strong style={{ color: '#333' }}>{student.username}</strong><br />
                          <small style={{ color: '#666' }}>{student.email}</small>
                        </div>
                        <button onClick={() => handleUnlinkStudent(student.id, student.username)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Desvincular
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

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
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/projects/${id}?populate=*`);
        const data = res.data?.data;

        if (!data) {
          throw new Error("Projeto não encontrado.");
        }

        const base = data.attributes || data;
        const docId = data.documentId || data.id;
        
        const institutionData = base.institution?.data || base.institution || null;

        setProject({
          documentId: docId,
          name: base.name || "",
          description: base.description || "",
          is_active: typeof base.is_active === "boolean" ? base.is_active : true,
          institutionId: institutionData?.documentId || institutionData?.id || "",
          maxStudents: base.max_students ?? base.maxStudents ?? 10,
        });
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
          <ProjectEditor
            key={project?.documentId || (isEditMode ? id : "new")}
            project={project}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

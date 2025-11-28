import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { InstitutionEditor } from "../components/InstitutionEditor";
import api from "../services/api";
import style from "./InstitutionEditorPage.module.css";

export function InstitutionEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id && id !== "nova");

  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;
    async function fetchInstitution() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/institutions/${id}`);
        const data = res.data?.data;

        if (!data) {
          throw new Error("Instituição não encontrada.");
        }

        const base = data.attributes || data;
        const docId = data.documentId || data.id;

        setInstitution({
          documentId: docId,
          name: base.name || "",
          address: base.address || "",
          description: base.description || "",
        });
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error?.message ||
            err?.message ||
            "Não foi possível carregar a instituição."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInstitution();
  }, [id, isEditMode]);

  function handleSuccess(saved) {
    navigate("/professor");
  }

  function handleCancel() {
    navigate("/professor");
  }

  const shouldShowEditor =
    !loading && !error && (!isEditMode || (isEditMode && institution));

  return (
    <div className={style.page}>
      <header className={style.pageHeader}>
        <button className={style.backButton} onClick={handleCancel}>
          ← Voltar
        </button>

        <div>
          <h1 className={style.title}>
            {isEditMode ? "Editar instituição" : "Nova instituição"}
          </h1>
          <p className={style.subtitle}>
            Preencha os dados da instituição e salve para atualizar o portal.
          </p>
        </div>
      </header>

      <main className={style.pageContent}>
        {loading && <p>Carregando...</p>}
        {error && <p className={style.error}>{error}</p>}

        {shouldShowEditor && (
          <InstitutionEditor
            key={institution?.documentId || (isEditMode ? id : "new")}
            institution={institution}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </main>

    </div>
  );
}

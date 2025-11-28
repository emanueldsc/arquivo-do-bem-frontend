import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import api, { baseURL } from "../services/api";
import style from "./InstitutionEditor.module.css"; // reaproveita o mesmo estilo do editor de instituição

// helper pra slug
function slugify(value) {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// mesma lógica de URL pública do Strapi
const RAW_STRAPI_URL = baseURL;
const STRAPI_PUBLIC_URL = RAW_STRAPI_URL.replace(/\/+$/, "").replace(
  /\/api$/,
  ""
);

export function ProjectEditor({ project = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(project?.documentId);

  const [name, setName] = useState(project?.name || "");
  const [isActive, setIsActive] = useState(
    typeof project?.is_active === "boolean" ? project.is_active : true
  );
  const [institutionId, setInstitutionId] = useState(
    project?.institutionId || ""
  );

  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
    ],
    content: project?.description || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
      },
    },
  });

  // Carrega instituições para o select
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await api.get(
          "/api/institutions?sort=name:asc&pagination[pageSize]=100"
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
        console.error("Erro ao buscar instituições:", err);
      }
    }

    fetchInstitutions();
  }, []);

  // Atualiza estados quando project mudar (modo edição)
  useEffect(() => {
    if (!project || !editor) return;

    setName(project.name || "");
    setIsActive(
      typeof project.is_active === "boolean" ? project.is_active : true
    );
    setInstitutionId(project.institutionId || "");
    editor.commands.setContent(project.description || "");
  }, [project, editor]);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleImageUpload(file) {
    if (!file || !editor) return;

    try {
      setLoading(true);
      resetMessages();

      const formData = new FormData();
      formData.append("files", file);

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data?.[0];
      if (!uploaded) throw new Error("Erro ao enviar imagem.");

      const rawUrl = uploaded.url;
      const fullUrl = rawUrl.startsWith("http")
        ? rawUrl
        : new URL(rawUrl, STRAPI_PUBLIC_URL).toString();

      editor.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error?.message ||
          "Não foi possível enviar a imagem."
      );
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClickAddImage() {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editor) return;

    resetMessages();
    setLoading(true);

    try {
      const descriptionHtml = editor.getHTML();

      const payload = {
        data: {
          name,
          slug: slugify(name),
          description: descriptionHtml,
          is_active: isActive,
          // relação com instituição - aqui uso o id selecionado
          institution: institutionId || null,
        },
      };

      let response;
      if (isEditMode) {
        response = await api.put(
          `/api/projects/${project.documentId}`,
          payload
        );
      } else {
        response = await api.post("/api/projects", payload);
      }

      const saved = response.data?.data;
      setSuccess(
        isEditMode
          ? "Projeto atualizado com sucesso."
          : "Projeto criado com sucesso."
      );

      onSuccess?.(saved);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Não foi possível salvar o projeto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={style.form} onSubmit={handleSubmit}>
      <header className={style.header}>
        <h2>{isEditMode ? "Editar projeto" : "Novo projeto"}</h2>
      </header>

      <div className={style.body}>
        {/* Nome */}
        <div className={style.field}>
          <label className={style.label} htmlFor="project-name">
            Nome *
          </label>
          <input
            id="project-name"
            type="text"
            className={style.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Ativo */}
        <div className={style.field}>
          <label className={style.label} htmlFor="project-active">
            Projeto ativo?
          </label>
          <label className={style.label} style={{ display: "flex", gap: 8 }}>
            <input
              id="project-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
            />
            <span>Ativo</span>
          </label>
        </div>

        {/* Instituição */}
        <div className={style.field}>
          <label className={style.label} htmlFor="project-institution">
            Instituição
          </label>
          <select
            id="project-institution"
            className={style.input}
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            disabled={loading || institutions.length === 0}
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição */}
        <div className={style.field}>
          <label className={style.label}>Descrição do projeto</label>

          {/* Toolbar */}
          <div className={style.toolbar}>
            <button
              type="button"
              className={`${style.toolbarButton} ${
                editor?.isActive("bold") ? style.isActive : ""
              }`}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={loading || !editor}
            >
              B
            </button>
            <button
              type="button"
              className={`${style.toolbarButton} ${
                editor?.isActive("italic") ? style.isActive : ""
              }`}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={loading || !editor}
            >
              I
            </button>
            <button
              type="button"
              className={`${style.toolbarButton} ${
                editor?.isActive("bulletList") ? style.isActive : ""
              }`}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={loading || !editor}
            >
              • Lista
            </button>
            <button
              type="button"
              className={`${style.toolbarButton} ${
                editor?.isActive("orderedList") ? style.isActive : ""
              }`}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={loading || !editor}
            >
              1. Lista
            </button>

            <span className={style.toolbarDivider} />

            <button
              type="button"
              className={style.toolbarButton}
              onClick={handleClickAddImage}
              disabled={loading || !editor}
            >
              Imagem
            </button>

            <span className={style.toolbarDivider} />

            <button
              type="button"
              className={style.toolbarButton}
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={loading || !editor}
            >
              Undo
            </button>
            <button
              type="button"
              className={style.toolbarButton}
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={loading || !editor}
            >
              Redo
            </button>
          </div>

          {/* input de upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />

          {/* editor */}
          <div className={style.editorWrapper}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* mensagens */}
        {error && <p className={style.error}>{error}</p>}
        {success && <p className={style.success}>{success}</p>}
      </div>

      <footer className={style.footer}>
        {onCancel && (
          <button
            type="button"
            className={`${style.button} ${style.secondaryButton}`}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          className={`${style.button} ${style.primaryButton}`}
          disabled={loading || !name.trim()}
        >
          {loading
            ? isEditMode
              ? "Salvando..."
              : "Criando..."
            : isEditMode
            ? "Salvar alterações"
            : "Criar projeto"}
        </button>
      </footer>
    </form>
  );
}

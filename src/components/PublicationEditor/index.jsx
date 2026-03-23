import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { baseURL } from "../../services/api";
import style from "../InstitutionEditor/index.module.css"; 

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

const STRAPI_PUBLIC_URL = baseURL.replace(/\/+$/, "").replace(/\/api$/, "");

export function PublicationEditor({ publication = null, projectId, onSuccess, onCancel }) {
  const isEditMode = Boolean(publication?.id || publication?.documentId);
  const { user, isProfessor } = useAuth();

  const [title, setTitle] = useState(publication?.title || "");
  const [state, setState] = useState(publication?.state || "DRAFT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false })],
    content: publication?.content || "",
    editorProps: { attributes: { class: "tiptap-editor-content" } },
  });

  useEffect(() => {
    if (!publication || !editor) return;
    setTitle(publication.title || "");
    setState(publication.state || "DRAFT");
    editor.commands.setContent(publication.content || "");
  }, [publication, editor]);

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
      const fullUrl = rawUrl.startsWith("http") ? rawUrl : new URL(rawUrl, STRAPI_PUBLIC_URL).toString();

      editor.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error?.message || "Não foi possível enviar a imagem.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editor || !user || !projectId) {
      setError("Faltam informações obrigatórias (Projeto ou Usuário).");
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const payload = {
        data: {
          title,
          slug: slugify(title),
          content: editor.getHTML(),
          state: isProfessor ? state : "DRAFT",
          project: projectId
        },
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/api/publications/${publication.documentId || publication.id}`, payload);
      } else {
        response = await api.post("/api/publications", payload);
      }

      setSuccess(isEditMode ? "Publicação atualizada!" : "Publicação criada com sucesso!");
      onSuccess?.(response.data?.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={style.form} onSubmit={handleSubmit}>
      <header className={style.header}>
        <h2>{isEditMode ? "Editar Publicação" : "Nova Publicação"}</h2>
      </header>
      <div className={style.body}>
        <div className={style.field}>
          <label className={style.label}>Título *</label>
          <input type="text" className={style.input} value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
        </div>
        <div className={style.field}>
          <label className={style.label}>Status de Envio</label>
          {isProfessor ? (
            <select className={style.input} value={state} onChange={(e) => setState(e.target.value)} disabled={loading}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          ) : (
            <div className={`${style.input}`} style={{ cursor: "not-allowed", backgroundColor: "#f5f5f5", color: "#666" }}>
              Enviado para análise do Professor
            </div>
          )}
        </div>
        <div className={style.field}>
          <label className={style.label}>Conteúdo *</label>
          <div className={style.toolbar}>
            <button type="button" className={`${style.toolbarButton} ${editor?.isActive("bold") ? style.isActive : ""}`} onClick={() => editor?.chain().focus().toggleBold().run()} disabled={loading || !editor}>B</button>
            <button type="button" className={`${style.toolbarButton} ${editor?.isActive("italic") ? style.isActive : ""}`} onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={loading || !editor}>I</button>
            <button type="button" className={`${style.toolbarButton} ${editor?.isActive("bulletList") ? style.isActive : ""}`} onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={loading || !editor}>• Lista</button>
            <span className={style.toolbarDivider}></span>
            <button type="button" className={`${style.toolbarButton}`} onClick={() => fileInputRef.current?.click()} disabled={loading || !editor}>Imagem</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files?.[0])} />
          <div className={style.editorWrapper} style={{ minHeight: "250px" }}>
            <EditorContent editor={editor} />
          </div>
        </div>
        {error && <p className={style.error}>{error}</p>}
        {success && <p className={style.success}>{success}</p>}
      </div>
      <footer className={style.footer}>
        {onCancel && <button type="button" className={`${style.button} ${style.secondaryButton}`} onClick={onCancel} disabled={loading}>Cancelar</button>}
        <button type="submit" className={`${style.button} ${style.primaryButton}`} disabled={loading || !title.trim()}>{loading ? "Salvando..." : "Salvar Publicação"}</button>
      </footer>
    </form>
  );
}

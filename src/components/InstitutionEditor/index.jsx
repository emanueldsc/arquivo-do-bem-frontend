import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import api, { baseURL } from "../../services/api";
import style from "./index.module.css";

const RAW_STRAPI_URL = baseURL

const STRAPI_PUBLIC_URL = RAW_STRAPI_URL.replace(/\/+$/, "").replace(
  /\/api$/,
  ""
);

export function InstitutionEditor({ institution = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(institution?.documentId);

  const [images, setImages] = useState([]); // [{ id, url, rawUrl, name }]
  const [usedImageUrls, setUsedImageUrls] = useState(new Set());

  const [name, setName] = useState(institution?.name || "");
  const [address, setAddress] = useState(institution?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // LOGO STATES
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(institution?.logoUrl || null);
  const [logoId, setLogoId] = useState(institution?.logoId || null);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
    ],
    content: institution?.description || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
      },
      handleDrop(view, event) {
        const url = event.dataTransfer?.getData("text/plain");
        if (url) {
          event.preventDefault();
          editor?.chain().focus().setImage({ src: url }).run();
          return true; 
        }
        return false; 
      },
    },
  });

  // Atualiza campos quando mudar a instituição
  useEffect(() => {
    if (institution && editor) {
      setName(institution.name || "");
      setAddress(institution.address || "");
      setLogoPreview(institution.logoUrl || null);
      setLogoId(institution.logoId || null);
      editor.commands.setContent(institution.description || "");
    }
  }, [institution, editor]);

  // Descobre quais imagens estão sendo usadas no conteúdo
  useEffect(() => {
    if (!editor) return;

    const updateUsedImages = () => {
      const html = editor.getHTML();
      const srcs = new Set();

      const regex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        srcs.add(match[1]);
      }
      setUsedImageUrls(srcs);
    };

    updateUsedImages();
    editor.on("update", updateUsedImages);

    return () => {
      editor.off("update", updateUsedImages);
    };
  }, [editor]);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setLogoId(null); 
    }
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
      if (!uploaded) {
        throw new Error("Erro ao enviar imagem.");
      }

      const rawUrl = uploaded.url; 

      const fullUrl = rawUrl.startsWith("http")
        ? rawUrl
        : new URL(rawUrl, STRAPI_PUBLIC_URL).toString();

      editor.chain().focus().setImage({ src: fullUrl }).run();

      setImages((prev) => [
        ...prev,
        {
          id: uploaded.id,
          url: fullUrl,
          rawUrl,
          name: uploaded.name,
        },
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error?.message ||
          "Não foi possível enviar a imagem."
      );
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleClickAddImage() {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }

  function handleImageDragStart(event, image) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", image.url);
  }

  async function handleDeleteImage(image) {
    const isUsed =
      usedImageUrls.has(image.url) || usedImageUrls.has(image.rawUrl);

    if (isUsed) {
      alert(
        "Esta imagem ainda está sendo usada no conteúdo. Remova-a do texto antes de excluir."
      );
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      await api.delete(`/api/upload/files/${image.id}`);

      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error?.message ||
          "Não foi possível excluir a imagem."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editor) return;

    resetMessages();
    setLoading(true);

    try {
      let finalLogoId = logoId;
      
      if (logoFile) {
        const formData = new FormData();
        formData.append("files", logoFile);
        const uploadRes = await api.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalLogoId = uploadRes.data?.[0]?.id;
      }

      const descriptionHtml = editor.getHTML();

      const payload = {
        data: {
          name,
          address,
          description: descriptionHtml,
          logo: finalLogoId // salva a referência do Logo no backend!
        },
      };

      let response;

      if (isEditMode) {
        response = await api.put(
          `/api/institutions/${institution.documentId}`,
          payload
        );
      } else {
        response = await api.post("/api/institutions", payload);
      }

      const saved = response.data?.data;
      setSuccess(
        isEditMode
          ? "Instituição atualizada com sucesso."
          : "Instituição criada com sucesso."
      );

      if (onSuccess) {
        onSuccess(saved);
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Não foi possível salvar a instituição."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={style.form} onSubmit={handleSubmit}>
      <header className={style.header}>
        <h2>{isEditMode ? "Editar instituição" : "Nova instituição"}</h2>
      </header>

      <div className={style.body}>
        {/* Nome */}
        <div className={style.field}>
          <label className={style.label} htmlFor="institution-name">
            Nome *
          </label>
          <input
            id="institution-name"
            type="text"
            className={style.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Endereço */}
        <div className={style.field}>
          <label className={style.label} htmlFor="institution-address">
            Endereço
          </label>
          <input
            id="institution-address"
            type="text"
            className={style.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Logo de Destaque */}
        <div className={style.field}>
          <label className={style.label}>Logo / Imagem de Destaque da Instituição</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', padding: "16px", border: "1px dashed var(--border)", borderRadius: "8px", backgroundColor: "#fafafa" }}>
            {logoPreview && (
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} 
              />
            )}
            <button 
              type="button" 
              className={style.toolbarButton} 
              onClick={() => logoInputRef.current?.click()}
              disabled={loading}
            >
              {logoPreview ? "Substituir Imagem de Destaque" : "+ Adicionar Imagem de Destaque"}
            </button>
            <input 
               type="file" 
               accept="image/*" 
               ref={logoInputRef} 
               style={{ display: "none" }} 
               onChange={handleLogoChange}
            />
          </div>
          <small style={{ color: "#666", display: "block", marginTop: "8px" }}>Esta imagem aparecerá nos cartões de listagem da Home e da aba de Instituições.</small>
        </div>

        {/* Descrição (editor de texto rico) */}
        <div className={style.field}>
          <label className={style.label}>Descrição (Corpo do texto / Post)</label>

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
              Imagem no texto
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />

          <div className={style.editorWrapper}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* ... existing remaining images panel code... */}
        <div className={style.imagesPanel}>
          <div className={style.imagesPanelHeader}>
            <div>
              <h3>Imagens de dentro da postagem</h3>
              <p>
                Estas imagens aparecem espalhadas no meio do texto da sua instituição.
              </p>
            </div>
          </div>

          {images.length === 0 ? (
            <p className={style.imagesEmpty}>
              Nenhuma imagem inserida no texto ainda.
            </p>
          ) : (
            <div className={style.imagesGrid}>
              {images.map((image) => {
                const isUsed =
                  usedImageUrls.has(image.url) ||
                  usedImageUrls.has(image.rawUrl);

                return (
                  <div
                    key={image.id}
                    className={`${style.imageItem} ${
                      isUsed ? style.imageUsed : style.imageUnused
                    }`}
                    draggable
                    onDragStart={(event) => handleImageDragStart(event, image)}
                  >
                    <img src={image.url} alt={image.name || ""} />

                    <div className={style.imageMeta}>
                      <span
                        className={`${style.imageStatus} ${
                          isUsed
                            ? style.imageStatusUsed
                            : style.imageStatusUnused
                        }`}
                      >
                        {isUsed ? "Em uso" : "Não usada"}
                      </span>

                      <button
                        type="button"
                        className={style.imageDeleteButton}
                        onClick={() => handleDeleteImage(image)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
            : "Criar instituição"}
        </button>
      </footer>
    </form>
  );
}

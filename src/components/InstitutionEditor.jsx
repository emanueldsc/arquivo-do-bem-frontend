import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import api, { baseURL } from "../services/api";
import style from "./InstitutionEditor.module.css";

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

  const fileInputRef = useRef(null);

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
          // usa a instância editor vinculada a este view
          editor?.chain().focus().setImage({ src: url }).run();
          return true; // Tiptap entende que tratamos o drop
        }
        return false; // deixa o Tiptap seguir o fluxo normal
      },
    },
  });

  // Atualiza campos quando mudar a instituição
  useEffect(() => {
    if (institution && editor) {
      setName(institution.name || "");
      setAddress(institution.address || "");
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

      const rawUrl = uploaded.url; // geralmente "/uploads/arquivo.jpg"

      const fullUrl = rawUrl.startsWith("http")
        ? rawUrl
        : new URL(rawUrl, STRAPI_PUBLIC_URL).toString();

      // Insere a imagem no conteúdo
      editor.chain().focus().setImage({ src: fullUrl }).run();

      // Guarda no painel de imagens desta postagem
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
      const descriptionHtml = editor.getHTML();

      const payload = {
        data: {
          name,
          address,
          description: descriptionHtml,
          // slug será gerado automaticamente pelo campo UID no Strapi
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

        {/* Descrição (editor de texto rico) */}
        <div className={style.field}>
          <label className={style.label}>Descrição (post de blog)</label>

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

          {/* Input de arquivo escondido para upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />

          {/* Área do editor */}
          <div className={style.editorWrapper}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Painel de imagens */}
        <div className={style.imagesPanel}>
          <div className={style.imagesPanelHeader}>
            <div>
              <h3>Imagens desta postagem</h3>
              <p>
                Arraste uma imagem para o editor para inseri-la. Imagens em uso
                aparecem destacadas em verde.
              </p>
            </div>
          </div>

          {images.length === 0 ? (
            <p className={style.imagesEmpty}>
              Nenhuma imagem enviada nesta edição ainda.
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

        {/* Mensagens */}
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

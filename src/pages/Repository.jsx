import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createDoc, fetchDocs } from "../services/docService";
import { fetchSemesters } from "../services/semesterService";
import {
  deleteRepositoryFile,
  uploadRepositoryFile,
} from "../services/uploadService";
import style from "./Repository.module.css";

import { baseURL } from "../services/api";

export function Repository() {


  const { user, isLogged } = useAuth();

  const [rows, setRows] = useState([]);

  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const isProfessor =
    isLogged && user?.role?.name?.toLowerCase() === "professor";

  function mapDocToRow(doc) {
    const fileObj = doc.file?.data ?? doc.file ?? null;
    const semesterObj = doc.semester?.data ?? doc.semester ?? null;

    const fileAttrs = fileObj?.attributes ?? fileObj ?? null;
    const semesterAttrs = semesterObj?.attributes ?? semesterObj ?? null;

    return {
      id: doc.id,
      name: doc.title ?? fileAttrs?.name ?? "Sem título",
      description: doc.description ?? "",
      type: fileAttrs?.mime?.split("/")[1]?.toUpperCase() || "ARQ",
      author:
        doc.createdBy?.username ||
        doc.createdBy?.data?.attributes?.username ||
        "Sistema",
      date: (doc.createdAt || "").slice(0, 10),
      url: fileAttrs?.url,
      semester: semesterObj?.id,
      semesterName: semesterAttrs?.name,
      fileId: fileObj?.id,
    };
  }

  useEffect(() => {
    async function loadSemesters() {
      try {
        const sems = await fetchSemesters();
        setSemesters(sems);

        if (sems.length > 0) {
          setSelectedSemesterId(String(sems[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSemesters();
  }, []);

  // 2) Carrega docs toda vez que muda o semestre selecionado
  useEffect(() => {
    async function loadDocs() {
      if (!selectedSemesterId) return;

      const docs = await fetchDocs({ semesterId: selectedSemesterId });
      setRows(docs.map(mapDocToRow));
    }
    loadDocs();
  }, [selectedSemesterId]);

  async function handleUploadSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!file) return setError("Selecione um arquivo.");

    try {
      setLoading(true);

      // 1) upload media
      const uploaded = await uploadRepositoryFile({ file, description });

      // 2) cria doc no banco
      await createDoc({
        title: uploaded.name,
        description,
        fileId: uploaded.id,
        semesterId: selectedSemesterId,
        is_public: true,
      });

      // 3) recarrega lista
      const docs = await fetchDocs({ semesterId: selectedSemesterId });
      setRows(docs.map(mapDocToRow));

      setFile(null);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(row) {
    const fullUrl = row.url?.startsWith("http")
      ? row.url
      : `${baseURL}${row.url}`;

    if (!row.url) return;
    window.open(fullUrl, "_blank");
  }

  async function handleDelete(row) {
    // no v5 sempre delete do arquivo pelo fileId
    if (!row.fileId) return;

    const ok = confirm(`Deseja deletar "${row.name}"?`);
    if (!ok) return;

    try {
      await deleteRepositoryFile(row.fileId);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error?.message || "Erro ao deletar arquivo.");
    }
  }

  return (
    <div className={style.container}>
      <section className={style.header}>
        <h2>Repositório de Arquivos</h2>

        {/* Select de semestre em cima da tabela */}
        <div className={style.filterBar}>
          <label htmlFor="semester">Semestre:</label>
          <select
            id="semester"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={style.cardGrid}>
        {rows.length === 0 && (
          <p className={style.empty}>Nenhum arquivo para este semestre.</p>
        )}

        {rows.map((row, index) => (
          <article key={index} className={style.docCard}>
            <header className={style.cardHeader}>
              <h4 className={style.cardTitle}>{row.name}</h4>
              {row.semesterName && (
                <span className={style.cardSemester}>{row.semesterName}</span>
              )}
            </header>

            {row.description && (
              <p className={style.cardDescription}>{row.description}</p>
            )}

            <div className={style.cardMeta}>
              <span>Autor: {row.author}</span>
              <span>Tipo: {row.type}</span>
              <span>Data: {row.date}</span>
            </div>

            <div className={style.cardActions}>
              <button
                className={style.btn}
                onClick={() => handleDownload(row)}
                disabled={!row.url}
              >
                Download
              </button>

              {isProfessor && (
                <button
                  className={style.btnDanger}
                  onClick={() => handleDelete(row)}
                >
                  Deletar
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* <section className={style.table}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Autor</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  Nenhum arquivo para este semestre.
                </td>
              </tr>
            )}

            {rows.map((row, index) => (
              <tr key={index || row.name}>
                <td>
                  <div className={style.docTitle}>{row.name}</div>
                </td>
                <td>{row.type}</td>
                <td>{row.author}</td>
                <td>{row.date}</td>
                <td>
                  <div className={style["actions-container"]}>
                    <button
                      className={style.btn}
                      onClick={() => handleDownload(row)}
                      disabled={!row.url}
                    >
                      Download
                    </button>

                    {isProfessor && (
                      <button
                        className={style.btnDanger}
                        onClick={() => handleDelete(row)}
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section> */}

      {isProfessor && (
        <section className={style.footer}>
          <h3>Enviar arquivo (administrador)</h3>

          <form onSubmit={handleUploadSubmit} className={style.form}>
            <div className={style.field}>
              <label htmlFor="file">Arquivo</label>
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                id="file"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>

            <div className={style.field}>
              <label htmlFor="description">Descrição</label>
              <input
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Relatório do semestre..."
              />
            </div>

            {error && <p className={style.error}>{error}</p>}

            <button className={style.btn} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

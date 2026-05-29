import { useEffect, useState } from "react";
import api from "../../services/api";
import style from "./index.module.css";

export function PublicationsManager() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPub, setViewingPub] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, pubId: null, text: "" });

  async function fetchPublications() {
    try {
      setLoading(true);
      // O populate=* traz as relações de author e projeto vinculados à publicação
      const res = await api.get("/api/publications?populate=*&sort=createdAt:desc");
      const list = res.data?.data || [];

      const formatted = list.map((item) => {
        const base = item.attributes || item;
        const docId = item.documentId || item.id;

        // Proteção extra contra estruturas aninhadas do Strapi v4 / v5
        const projectData = base.project?.data?.attributes || base.project || {};
        const authorData = base.student_author?.data?.attributes || base.student_author || {};

        return {
          id: docId,
          title: base.title || "(sem título)",
          content: base.content || "",
          state: base.state || "DRAFT",
          observations: base.observations || "",
          createdAt: base.createdAt,
          projectName: projectData.name || "Sem projeto vinculado",
          authorName: authorData.username || authorData.name || "Aluno Desconhecido",
        };
      });

      setPublications(formatted);
    } catch (err) {
      console.error("Erro ao buscar publicações:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPublications();
  }, []);

  async function handleUpdateState(id, newState) {
    try {
      await api.put(`/api/publications/${id}`, {
        data: { state: newState },
      });

      setPublications((prev) =>
        prev.map((p) => (p.id === id ? { ...p, state: newState } : p))
      );
      
      if (viewingPub && viewingPub.id === id) {
        setViewingPub((prev) => ({ ...prev, state: newState }));
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar o status da publicação.");
    }
  }

  async function handleRequestChanges(e) {
    e.preventDefault();
    if (!feedbackModal.pubId) return;
    try {
      await api.put(`/api/publications/${feedbackModal.pubId}`, {
        data: { state: "DRAFT", observations: feedbackModal.text },
      });

      setPublications((prev) =>
        prev.map((p) => (p.id === feedbackModal.pubId ? { ...p, state: "DRAFT", observations: feedbackModal.text } : p))
      );
      
      if (viewingPub && viewingPub.id === feedbackModal.pubId) {
        setViewingPub((prev) => ({ ...prev, state: "DRAFT", observations: feedbackModal.text }));
      }
      
      setFeedbackModal({ isOpen: false, pubId: null, text: "" });
      alert("Solicitação de alterações enviada ao aluno.");
    } catch (err) {
      console.error("Erro ao solicitar alterações:", err);
      alert("Erro ao solicitar alterações da publicação.");
    }
  }

  async function handleDeleteClick(id) {
    if (!confirm("Tem certeza que deseja excluir permanentemente esta publicação?")) return;

    try {
      await api.delete(`/api/publications/${id}`);
      if (viewingPub && viewingPub.id === id) setViewingPub(null);
      
      setPublications((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao excluir publicação:", err);
      alert("Erro ao excluir. Verifique o console.");
    }
  }

  // Agrupa as publicações por projeto
  const groupedPublications = publications.reduce((acc, pub) => {
    const proj = pub.projectName;
    if (!acc[proj]) acc[proj] = [];
    acc[proj].push(pub);
    return acc;
  }, {});

  return (
    <section className="container tab-container">
      <section className={style.header}>
        <h1>Gestão de Publicações</h1>
        <p>Revise, aprove ou devolva para edição as publicações feitas pelos alunos.</p>
      </section>

      {viewingPub ? (
        // VISUALIZADOR DE PUBLICAÇÃO PARA AVALIAÇÃO DO PROFESSOR
        <section className={style.viewerContainer}>
          <button className="btn" onClick={() => setViewingPub(null)} style={{ marginBottom: '1.5rem' }}>
            ← Voltar para listagem
          </button>
          
          <h2 className={style.viewerTitle}>{viewingPub.title}</h2>
          <div className={style.viewerMeta}>
            <span><strong>Autor:</strong> {viewingPub.authorName}</span>
            <span><strong>Projeto:</strong> {viewingPub.projectName}</span>
            <span>
              <strong>Status:</strong>{" "}
              <span className={`${style.badge} ${viewingPub.state === "PUBLISHED" ? style.badgePublished : style.badgePending}`}>
                {viewingPub.state === "PUBLISHED" ? "Publicada" : "Pendente/Rascunho"}
              </span>
            </span>
          </div>
          
          <div className={style.viewerContent}>
            <div dangerouslySetInnerHTML={{ __html: viewingPub.content }} />
          </div>
          
          <div className={style.viewerActions}>
            {viewingPub.state !== "PUBLISHED" && (
              <>
                <button className={`btn ${style.btnApprove}`} onClick={() => handleUpdateState(viewingPub.id, 'PUBLISHED')}>
                  ✓ Aprovar e Publicar
                </button>
                <button className="btn" style={{ backgroundColor: '#eab308', color: 'white', borderColor: '#eab308' }} onClick={() => setFeedbackModal({ isOpen: true, pubId: viewingPub.id, text: viewingPub.observations || "" })}>
                  ✎ Solicitar Alterações
                </button>
              </>
            )}
            
            {viewingPub.state === "PUBLISHED" && (
              <button className={`btn ${style.btnDraft}`} onClick={() => handleUpdateState(viewingPub.id, 'DRAFT')}>
                ⟲ Voltar para Edição (Ocultar)
              </button>
            )}
            
            <button className="btn btn-remove" onClick={() => handleDeleteClick(viewingPub.id)}>
              Excluir Publicação
            </button>
          </div>
        </section>
      ) : (
        // LISTAGEM DE PUBLICAÇÕES
        Object.keys(groupedPublications).length === 0 ? (
          <p className={style.emptyMessage}>
            {loading ? "Carregando publicações..." : "Nenhuma publicação foi registrada pelos alunos."}
          </p>
        ) : (
          Object.keys(groupedPublications).map((project) => (
            <div key={project} className={`table ${style.projectGroup}`}>
              <h3 className={style.projectHeader}>
                📁 {project}
              </h3>
              <table style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <thead>
                  <tr>
                    <th className={style["table-header-col-title"]}>Título</th>
                    <th className={style["table-header-col-author"]}>Autor(a)</th>
                    <th className={style["table-header-col-status"]}>Status</th>
                    <th className={style["table-header-col-date"]}>Data</th>
                    <th className={style["table-header-col-actions"]}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPublications[project].map((pub) => (
                    <tr key={pub.id}>
                      <td>{pub.title}</td>
                      <td>{pub.authorName}</td>
                      <td>
                        <span className={`${style.badge} ${pub.state === 'PUBLISHED' ? style.badgePublished : style.badgePending}`}>
                          {pub.state === "PUBLISHED" ? "Publicada" : "Pendente"}
                        </span>
                      </td>
                      <td>{new Date(pub.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className={style.btnContainer}>
                        <button className="btn" onClick={() => setViewingPub(pub)}>Ler e Avaliar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )
      )}

      {feedbackModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <form onSubmit={handleRequestChanges} style={{ backgroundColor: 'var(--surface, #fff)', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Solicitar Alterações</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>Adicione as observações detalhando o que o aluno precisa alterar:</p>
            <textarea 
              required
              style={{ width: '100%', minHeight: '120px', padding: '12px', margin: '12px 0', borderRadius: '4px', border: '1px solid var(--border, #ccc)', resize: 'vertical', fontFamily: 'inherit' }}
              value={feedbackModal.text}
              onChange={(e) => setFeedbackModal(prev => ({...prev, text: e.target.value}))}
              placeholder="Ex: Por favor, melhore a introdução e revise a formatação das imagens..."
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn" onClick={() => setFeedbackModal({ isOpen: false, pubId: null, text: "" })}>Cancelar</button>
              <button type="submit" className="btn" style={{ backgroundColor: '#eab308', color: 'white', borderColor: '#eab308' }}>Enviar Solicitação</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
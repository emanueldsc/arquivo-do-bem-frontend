import { useEffect, useState } from "react";
import api from "../../services/api";
import style from "./pages/ProjectManager.module.css";

export function PublicationsManager() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPub, setViewingPub] = useState(null);

  async function fetchPublications() {
    try {
      setLoading(true);
      // O populate=* vai trazer o projeto e o author (student_author) vinculados
      const res = await api.get("/api/publications?populate=*&sort=createdAt:desc");
      const list = res.data?.data || [];

      const formatted = list.map((item) => {
        const base = item.attributes || item;
        const docId = item.documentId || item.id;

        // Mapeamentos de relacionamento protegidos (Strapi v4 / v5)
        const projectData = base.project?.data?.attributes || base.project || {};
        const authorData = base.student_author?.data?.attributes || base.student_author || {};

        return {
          id: docId,
          title: base.title || "(sem título)",
          content: base.content || "",
          state: base.state || "DRAFT",
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

      // Atualiza o estado local para uma UI mais rápida
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

  // Agrupa as publicações pelo nome do projeto
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
        // VISUALIZADOR DE PUBLICAÇÃO (LEITURA E APROVAÇÃO)
        <section className={style.tableWrapper} style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button className="btn" onClick={() => setViewingPub(null)} style={{ marginBottom: '1.5rem' }}>
            ← Voltar para listagem
          </button>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{viewingPub.title}</h2>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <span><strong>Autor:</strong> {viewingPub.authorName}</span>
            <span><strong>Projeto:</strong> {viewingPub.projectName}</span>
            <span>
              <strong>Status:</strong>{" "}
              <span style={{ color: viewingPub.state === "PUBLISHED" ? '#1b8f3a' : '#d97706' }}>
                {viewingPub.state === "PUBLISHED" ? "Publicada" : "Pendente/Rascunho"}
              </span>
            </span>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '6px', border: '1px solid #eaeaea', minHeight: '300px' }}>
            <div dangerouslySetInnerHTML={{ __html: viewingPub.content }} />
          </div>
          
          <div className={style.btnContainer} style={{ marginTop: '24px', gap: '12px' }}>
            {viewingPub.state !== "PUBLISHED" && (
              <button className="btn" style={{ backgroundColor: '#1b8f3a', color: 'white', borderColor: '#1b8f3a' }} onClick={() => handleUpdateState(viewingPub.id, 'PUBLISHED')}>
                ✓ Aprovar e Publicar
              </button>
            )}
            
            {viewingPub.state === "PUBLISHED" && (
              <button className="btn" style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }} onClick={() => handleUpdateState(viewingPub.id, 'DRAFT')}>
                ⟲ Voltar para Edição (Ocultar)
              </button>
            )}
            
            <button className="btn btn-remove" onClick={() => handleDeleteClick(viewingPub.id)}>
              Excluir Publicação
            </button>
          </div>
        </section>
      ) : (
        // LISTAGEM ESTRATIFICADA POR PROJETO
        Object.keys(groupedPublications).length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
            {loading ? "Carregando publicações..." : "Nenhuma publicação foi registrada pelos alunos."}
          </p>
        ) : (
          Object.keys(groupedPublications).map((project) => (
            <div key={project} className="table" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ padding: '12px 16px', margin: 0, backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid var(--border)', borderBottom: 'none', fontSize: '1.1rem' }}>
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
                        <span style={{
                          padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                          backgroundColor: pub.state === 'PUBLISHED' ? '#e7f6ec' : '#fef3c7',
                          color: pub.state === 'PUBLISHED' ? '#1b8f3a' : '#d97706'
                        }}>
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
    </section>
  );
}
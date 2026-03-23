import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PublicationEditor } from "../../components/PublicationEditor";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import style from "./index.module.css";

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function StudentDashboard() {
  const { user, setUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [projectToBind, setProjectToBind] = useState(null);
  const [associating, setAssociating] = useState(false);

  const [publications, setPublications] = useState([]);
  const [isEditingPublication, setIsEditingPublication] = useState(false);
  const [publicationToEdit, setPublicationToEdit] = useState(null);
  const [loadingPubs, setLoadingPubs] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Busca projetos e popula users pra contar capacidade atual
        const res = await api.get("/api/projects?populate[users][fields][0]=id&filters[is_active][$eq]=true");
        const list = res.data?.data || [];
        
        const mapped = list.map(item => {
          const attr = item.attributes || item;
          const currentCount = attr.users?.data?.length || attr.users?.length || 0;
          
          return {
            id: item.documentId || item.id,
            rawId: item.id,
            name: attr.name,
            slug: attr.slug,
            description: attr.description,
            maxStudents: attr.max_students || 0,
            currentCount
          };
        });
        
        setProjects(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchMe() {
      try {
        // Atualizamos o state local do user para garantir que a relation 'projects' está up to date
        const res = await api.get("/api/users/me?populate=projects");
        setUser(res.data);
      } catch(err) {
        console.error(err);
      }
    }
    
    fetchMe().then(loadData);
  }, [setUser]);

  const userProject = user?.projects && user.projects.length > 0 ? user.projects[0] : null;

  useEffect(() => {
    async function fetchPublications() {
      if (!userProject) return;
      try {
        setLoadingPubs(true);
        const res = await api.get(`/api/publications?filters[project][documentId][$eq]=${userProject.documentId || userProject.id}&filters[project][id][$eq]=${userProject.id}&populate=student_author&sort=createdAt:desc`);
        const list = res.data?.data || [];
        setPublications(list.map(p => {
          const auth = p.student_author || p.attributes?.student_author?.data?.attributes || p.attributes?.student_author;
          return {
            id: p.documentId || p.id,
            documentId: p.documentId,
            title: p.title || p.attributes?.title,
            content: p.content || p.attributes?.content,
            state: p.state || p.attributes?.state,
            authorName: auth?.username || auth?.name || "Aluno",
            createdAt: p.createdAt || p.attributes?.createdAt,
          };
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPubs(false);
      }
    }
    fetchPublications();
  }, [userProject]);

  async function handleConfirmBind() {
    if (!projectToBind || !user) return;
    
    setAssociating(true);
    try {
      const jwt = localStorage.getItem("jwt");
      await api.put(`/api/users/${user.id}`, {
        projects: [projectToBind.rawId]
      }, {
        headers: { Authorization: `Bearer ${jwt}`}
      });
      
      // Update local state by forcing a re-fetch
      const res = await api.get("/api/users/me?populate=projects");
      setUser(res.data);
      
    } catch(err) {
      console.error(err);
      alert("Erro ao tentar vincular ao projeto.");
    } finally {
      setAssociating(false);
      setProjectToBind(null);
    }
  }

  function renderProjectsTab() {
    if (loading) return <p>Carregando projetos de extensão da plataforma...</p>;

    if (userProject) {
      return (
        <div className={style.lockedPanel}>
          <h3>Acesso Bloqueado</h3>
          <p>Você já está ativamente vinculado ao projeto institucional:</p>
          <p className={style.featuredProjectName}>{userProject.name}</p>
          <p className={style.tip}>Seu registro como aluno deste projeto está gravado de forma permanente. Para alterar sua associação estudantil a outro projeto de extensão, entre em contato direto com o Professor para realizar a remoção do seu perfil na aba administrativa.</p>
        </div>
      );
    }

    return (
      <div className={style.projectList}>
        <h3>Selecione um Projeto</h3>
        <p className={style.tip} style={{marginBottom: "1rem", marginTop: "0"}}>Atencão: Após se associar você não poderá desfazer essa ação sem a intervenção de um administrador.</p>
        
        {projects.length === 0 ? (
          <p>Nenhum projeto foi aberto ou deferido na plataforma até o momento.</p>
        ) : (
          projects.map(proj => {
            const isFull = proj.maxStudents > 0 ? proj.currentCount >= proj.maxStudents : false;
            
            return (
              <div key={proj.id} className={style.projectCard}>
                <div className={style.projectInfo}>
                  <h4>{proj.name}</h4>
                  <p className={style.projectDesc}>
                    {stripHtml(proj.description).substring(0, 160)}
                    {stripHtml(proj.description).length > 160 ? "..." : ""}
                  </p>
                  <div>
                    {proj.maxStudents > 0 ? (
                      <span className={`${style.badge} ${isFull ? style.badgeFull : style.badgeOpen} w3-margin-right`}>
                        Vagas Preenchidas: {proj.currentCount} / {proj.maxStudents}
                      </span>
                    ) : (
                      <span className={`${style.badge} ${style.badgeOpen} w3-margin-right`}>Vagas Ilimitadas</span>
                    )}
                  </div>
                </div>
                <div className={style.projectActions}>
                  <Link 
                    to={`/projetos/${proj.slug}`} 
                    className={`w3-button w3-white w3-border w3-round w3-small w3-margin-right ${style.btnView}`}
                    target="_blank"
                  >
                    Ver Projeto
                  </Link>
                  <button 
                    className={style.btnBind} 
                    disabled={isFull} 
                    onClick={() => setProjectToBind(proj)}
                  >
                    {isFull ? "Turma Lotada" : "Vincular-se"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  function handlePubSuccess() {
    setIsEditingPublication(false);
    setPublicationToEdit(null);
    window.location.reload(); 
  }

  function renderPublicationsTab() {
    if (!userProject) {
      return (
        <div className={style.lockedPanel}>
          <h3>Acesso Restrito</h3>
          <p>Você precisa se vincular formalmente a um projeto na aba "Projetos" primeiro antes de acessar ou postar relatórios e publicações estendidas.</p>
        </div>
      );
    }

    if (isEditingPublication) {
      return (
        <div style={{ marginTop: "1rem" }}>
          <PublicationEditor 
            publication={publicationToEdit}
            projectId={userProject.id} 
            onSuccess={handlePubSuccess} 
            onCancel={() => {
              setIsEditingPublication(false);
              setPublicationToEdit(null);
            }} 
          />
        </div>
      );
    }

    return (
      <div className={style.publicationList}>
        <div className={style.pubHeader}>
          <h3 className={style.dynamicTitle}>Projeto: {userProject.name}</h3>
          <button 
            className={`${style.btnBind} ${style.btnNewPub}`} 
            onClick={() => {
              setPublicationToEdit(null);
              setIsEditingPublication(true);
            }}
          >
            + Escrever Relatório
          </button>
        </div>

        {loadingPubs ? (
          <p className={style.tip}>Carregando banco de publicações...</p>
        ) : publications.length === 0 ? (
          <p className={style.tip}>Nenhuma publicação foi registrada neste projeto ainda. Seja o primeiro!</p>
        ) : (
          <div className={style.pubGrid}>
            {publications.map(pub => (
              <div key={pub.id} className={style.pubCard}>
                <div className={style.pubCardContent}>
                  <h4>{pub.title}</h4>
                  <div className={style.pubMeta}>
                    <span className={style.pubAuthor}>Autor(a): {pub.authorName}</span>
                    <span className={style.pubDate}>{new Date(pub.createdAt).toLocaleDateString()}</span>
                    <span className={`${style.badge} ${pub.state === "PUBLISHED" ? style.badgeOpen : style.badgeFull}`}>
                      {pub.state === "PUBLISHED" ? "Publicada" : "Rascunho"}
                    </span>
                  </div>
                </div>
                {pub.state === "DRAFT" && (
                  <div className={style.pubCardActions}>
                    <button 
                      className={`w3-button w3-small w3-round w3-border ${style.btnEditPub}`}
                      onClick={() => {
                        setPublicationToEdit(pub);
                        setIsEditingPublication(true);
                      }}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={style.header}>
        <h2 className={style.headerTitle}>Painel do Aluno</h2>
        <div className={style.userArea}>
          <span className={style.userName}>{user?.username}</span>
          <span className={style.userEmail}>{user?.email}</span>
        </div>
      </div>

      <section className={style.container}>
        <div className={`w3-bar w3-white ${style.tabBar}`}>
          <button 
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${activeTab === "projects" ? style.active : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projetos e Inscrições
          </button>
          <button 
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${activeTab === "publications" ? style.active : ""}`}
            onClick={() => setActiveTab("publications")}
          >
            Publicações
          </button>
        </div>

        <section className={style.content}>
          <div style={{ display: activeTab === "projects" ? "block" : "none" }} className="w3-container w3-padding-0">
            {renderProjectsTab()}
          </div>
          <div style={{ display: activeTab === "publications" ? "block" : "none" }} className="w3-container w3-padding-0">
            {renderPublicationsTab()}
          </div>
        </section>
      </section>

      <ConfirmModal 
        isOpen={!!projectToBind}
        title="Confirmar Vínculo Oficial"
        message={`Tem plena certeza que deseja se vincular integralmente ao projeto "${projectToBind?.name}"?\nEsta ação selará a sua matrícula de extensão sendo irreversível por você mesmo.`}
        confirmText={associating ? "Associando registro..." : "Sim, associar"}
        cancelText="Voltar e Revisar"
        onConfirm={handleConfirmBind}
        onCancel={() => !associating && setProjectToBind(null)}
      />
    </>
  );
}

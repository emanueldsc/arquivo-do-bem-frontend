import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PublicationEditor } from "../../components/PublicationEditor";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { projectService } from "../../services/projectService";
import { fetchSemesters, updateSemesterImpactLives } from "../../services/semesterService";
import { buildProjectOccupancyMap, canAssociateToProject, getActiveProject, isProjectEditable } from "../../utils/studentProjectSelection";
import style from "./index.module.css";

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDocumentId(value) {
  if (!value) return "";
  return String(value.documentId || value.id || value);
}

function relationList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.data || [];
}

function mapRelatedUser(item) {
  const base = item?.attributes || item || {};
  return {
    id: item?.id,
    documentId: item?.documentId || item?.id,
    username: base.username || base.name || "Aluno",
    email: base.email || "",
  };
}

function mapSemester(item) {
  const base = item?.attributes || item || {};
  return {
    id: item?.id,
    documentId: item?.documentId || item?.id,
    name: base.name || base.title || "Sem nome",
    year: base.year || "",
    impactedLives: base.impacted_lives ?? base.impactedLives ?? 0,
  };
}

export function StudentDashboard() {
  const { user, setUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("studentActiveTab") || "projects";
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsRefreshToken, setProjectsRefreshToken] = useState(0);
  
  const [projectToBind, setProjectToBind] = useState(null);
  const [associating, setAssociating] = useState(false);

  const [publications, setPublications] = useState([]);
  const [isEditingPublication, setIsEditingPublication] = useState(false);
  const [publicationToEdit, setPublicationToEdit] = useState(null);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [refreshPubs, setRefreshPubs] = useState(0);

  const [projectDetails, setProjectDetails] = useState(null);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [currentSemester, setCurrentSemester] = useState(null);
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const [leaderSaving, setLeaderSaving] = useState(false);
  const [semesterDrafts, setSemesterDrafts] = useState({});
  const [savingSemesterId, setSavingSemesterId] = useState("");
  const [metricsMessage, setMetricsMessage] = useState("");

  useEffect(() => {
    sessionStorage.setItem("studentActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    async function loadCurrentSemester() {
      try {
        const semesters = await fetchSemesters();
        const today = normalizeDate(new Date());

        const activeSemester = (semesters || []).find((semester) => {
          const startDate = normalizeDate(semester?.start_date);
          const endDate = normalizeDate(semester?.end_date);

          if (!startDate || !endDate) return false;
          return today >= startDate && today <= endDate;
        });

        setCurrentSemester(activeSemester || semesters?.[0] || null);
      } catch (err) {
        console.error("Erro ao carregar semestre atual:", err);
      }
    }

    loadCurrentSemester();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const projectsRes = await api.get(
          "/api/projects?populate[users][fields][0]=id&populate[users][fields][1]=documentId&populate[users][fields][2]=username&filters[is_active][$eq]=true&populate[users][populate][0]=projects"
        );

        const projectsList = projectsRes.data?.data || [];
        const occupancyMap = buildProjectOccupancyMap(projectsList);
        const occupancyList = await projectService.getProjectOccupancy().catch(() => []);
        const occupancyByProjectId = Object.fromEntries(
          (occupancyList || []).map((item) => [String(item.documentId || item.id), Number(item.currentCount || 0)])
        );
        
        const mapped = projectsList.map(item => {
          const attr = item.attributes || item;
          const docId = item.documentId || item.id;
          const rawId = item.id;
          const directUsers = attr.users?.data || attr.users || [];
          const currentCount = occupancyByProjectId[String(docId)] ?? occupancyByProjectId[String(rawId)] ?? occupancyMap[docId] ?? occupancyMap[String(rawId)] ?? directUsers.length;
          
          return {
            id: docId,
            rawId,
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
        // Adicionado o populate da 'role' para que o menu do NavBar não perca a referência e suma!
        const res = await api.get("/api/users/me?populate[0]=projects&populate[1]=role");
        setUser(res.data);
      } catch(err) {
        console.error(err);
      }
    }
    
    fetchMe().then(loadData);
  }, [projectsRefreshToken, setUser]);

  const userProjects = Array.isArray(user?.projects) ? user.projects : [];
  const activeProject = getActiveProject(userProjects, selectedProjectId);
  const userProject = activeProject;

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
            observations: p.observations || p.attributes?.observations || "",
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
  }, [userProject, refreshPubs]);

  useEffect(() => {
    async function fetchProjectDetails() {
      if (!userProject) {
        setProjectDetails(null);
        setSemesterDrafts({});
        setSelectedLeaderId("");
        return;
      }

      try {
        setLoadingProjectDetails(true);
        const details = await projectService.getProjectMetrics(
          userProject.documentId || userProject.id
        );

        setProjectDetails(details);
        setSelectedLeaderId(details?.leader?.documentId || details?.leader?.id || "");

        const drafts = {};
        (details?.semesters || []).forEach((semester) => {
          drafts[getDocumentId(semester)] = String(semester.impactedLives ?? 0);
        });
        setSemesterDrafts(drafts);
      } catch (err) {
        console.error("Erro ao buscar métricas do projeto:", err);
      } finally {
        setLoadingProjectDetails(false);
      }
    }

    fetchProjectDetails();
  }, [userProject]);

  useEffect(() => {
    if (!userProjects.length) {
      setSelectedProjectId("");
      return;
    }

    if (!selectedProjectId) {
      setSelectedProjectId(getDocumentId(activeProject));
    }
  }, [activeProject, selectedProjectId, userProjects.length]);

  const currentUserId = getDocumentId(user);
  const projectLeaderId = getDocumentId(projectDetails?.leader);
  const isProjectLeader = Boolean(projectLeaderId && projectLeaderId === currentUserId);
  const projectParticipants = (projectDetails?.users || [])
    .filter((participant) => Boolean(getDocumentId(participant)))
    .filter((participant, index, list) => {
      const participantId = getDocumentId(participant);
      return list.findIndex((item) => getDocumentId(item) === participantId) === index;
    });
  const leaderOptions = projectParticipants.filter(
    (participant) => getDocumentId(participant) !== currentUserId
  );
  const totalImpactedLives = (projectDetails?.semesters || []).reduce(
    (sum, semester) => sum + Number(semester.impactedLives || 0),
    0
  );

  async function handleConfirmBind() {
    if (!projectToBind || !user) return;

    if (!canAssociateToProject(userProjects, currentSemester)) {
      alert("Você já está associado a um projeto neste semestre. Cada aluno pode participar de apenas um projeto por semestre.");
      setProjectToBind(null);
      return;
    }
    
    setAssociating(true);
    try {
      const jwt = localStorage.getItem("jwt");
      await api.put(`/api/users/${user.id}`, {
        projects: [projectToBind.rawId]
      }, {
        headers: { Authorization: `Bearer ${jwt}`}
      });
      
      // Update local state by forcing a re-fetch
      const res = await api.get("/api/users/me?populate[0]=projects&populate[1]=role");
      setUser(res.data);
      setProjectsRefreshToken((prev) => prev + 1);
      
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

    const semesterAssociationBlocked = !canAssociateToProject(userProjects, currentSemester);
    const availableProjects = projects.filter((proj) => {
      const alreadyLinked = userProjects.some((project) => getDocumentId(project) === proj.id);
      const isFull = proj.maxStudents > 0 ? proj.currentCount >= proj.maxStudents : false;
      return !alreadyLinked && !isFull && !semesterAssociationBlocked;
    });

    return (
      <div className={style.projectList}>
        <h3>Selecione um Projeto</h3>
        <p className={style.tip} style={{ marginBottom: "1rem", marginTop: "0" }}>
          Atencão: Após se associar você não poderá desfazer essa ação sem a intervenção de um administrador.
        </p>

        {userProjects.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.75rem" }}>Projetos vinculados</h4>
            <div className={style.projectList}>
              {userProjects.map((project) => {
                const isActive = isProjectEditable(project, userProject);
                const projectDocId = getDocumentId(project);

                return (
                  <div key={projectDocId} className={style.projectCard}>
                    <div className={style.projectInfo}>
                      <h4>{project.name}</h4>
                      <p className={style.projectDesc}>
                        {project.description ? stripHtml(project.description).substring(0, 160) : "Projeto vinculado ao seu perfil."}
                        {project.description && stripHtml(project.description).length > 160 ? "..." : ""}
                      </p>
                      <div>
                        <span className={`${style.badge} ${isActive ? style.badgeOpen : style.badgeFull} w3-margin-right`}>
                          {isActive ? "Projeto Atual" : "Projeto Anterior"}
                        </span>
                      </div>
                    </div>
                    <div className={style.projectActions}>
                      <button
                        className={style.btnBind}
                        onClick={() => setSelectedProjectId(projectDocId)}
                      >
                        {isActive ? "Projeto selecionado" : "Selecionar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {semesterAssociationBlocked && (
          <p className={style.tip} style={{ marginBottom: "1rem" }}>
            Você já está associado a um projeto neste semestre. Cada aluno pode participar de apenas um projeto por semestre.
          </p>
        )}

        {availableProjects.length === 0 ? (
          <p>Nenhum projeto disponível para vínculo no momento.</p>
        ) : (
          <>
            <h4 style={{ marginBottom: "0.75rem" }}>Projetos disponíveis</h4>
            {availableProjects.map((proj) => {
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
            })}
          </>
        )}
      </div>
    );
  }

  function handlePubSuccess() {
    setIsEditingPublication(false);
    setPublicationToEdit(null);
    setRefreshPubs(prev => prev + 1);
  }

  function renderPublicationsTab() {
    if (loading) {
      return <p className={style.tip} style={{ padding: "1.5rem" }}>Verificando vínculo institucional do aluno...</p>;
    }

    if (!userProject) {
      return (
        <div className={style.lockedPanel}>
          <h3>Acesso Restrito</h3>
          <p>Você precisa se vincular formalmente a um projeto na aba "Projetos" primeiro antes de acessar ou postar relatórios e publicações estendidas.</p>
        </div>
      );
    }

    const editableProject = isProjectEditable(userProject, userProject);
    if (!editableProject) {
      return (
        <div className={style.lockedPanel}>
          <h3>Projeto não editável</h3>
          <p>Este projeto está vinculado ao seu perfil, mas não é o projeto atualmente selecionado para edição.</p>
          <p className={style.tip}>Selecione o projeto ativo na aba "Projetos e Inscrições" para continuar.</p>
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

  async function handleSetLeader() {
    if (!projectDetails?.documentId || !selectedLeaderId) return;

    setLeaderSaving(true);
    setMetricsMessage("");

    try {
      await projectService.setProjectLeader(
        projectDetails.documentId,
        selectedLeaderId
      );

      const updated = await projectService.getProjectMetrics(
        projectDetails.documentId
      );

      setProjectDetails(updated);
      setSelectedLeaderId(updated?.leader?.documentId || updated?.leader?.id || "");
      setMetricsMessage("Líder do projeto atualizado com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar líder:", err);
      setMetricsMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Não foi possível atualizar o líder do projeto."
      );
    } finally {
      setLeaderSaving(false);
    }
  }

  async function handleSaveSemesterImpact(semesterDocumentId) {
    if (!semesterDocumentId) return;

    const impactedLives = semesterDrafts[semesterDocumentId] ?? 0;
    setSavingSemesterId(semesterDocumentId);
    setMetricsMessage("");

    try {
      await updateSemesterImpactLives(semesterDocumentId, impactedLives);

      const updated = await projectService.getProjectMetrics(
        projectDetails.documentId
      );

      setProjectDetails(updated);
      setMetricsMessage("Métrica de vidas impactadas atualizada.");
    } catch (err) {
      console.error("Erro ao salvar métricas:", err);
      setMetricsMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Não foi possível salvar a métrica desse semestre."
      );
    } finally {
      setSavingSemesterId("");
    }
  }

  function renderMetricsTab() {
    if (loading || loadingProjectDetails) {
      return <p className={style.tip} style={{ padding: "1.5rem" }}>Carregando métricas do projeto...</p>;
    }

    if (!userProject) {
      return (
        <div className={style.lockedPanel}>
          <h3>Acesso Restrito</h3>
          <p>Você precisa se vincular a um projeto para visualizar e editar as métricas do grupo.</p>
        </div>
      );
    }

    if (!isProjectEditable(userProject, userProject)) {
      return (
        <div className={style.lockedPanel}>
          <h3>Projeto não editável</h3>
          <p>As métricas deste projeto só podem ser consultadas enquanto ele estiver selecionado como projeto atual.</p>
        </div>
      );
    }

    if (!projectDetails) {
      return <p className={style.tip}>Não foi possível carregar os dados de métricas desse projeto.</p>;
    }

    return (
      <div className={style.metricsPanel}>
        <div className={style.metricsSummary}>
          <div className={style.metricsCard}>
            <span className={style.metricsLabel}>Líder atual</span>
            <strong>{projectDetails.leader?.username || projectDetails.leader?.email || "Sem líder definido"}</strong>
          </div>
          <div className={style.metricsCard}>
            <span className={style.metricsLabel}>Semestres cadastrados</span>
            <strong>{projectDetails.semesters?.length || 0}</strong>
          </div>
          <div className={style.metricsCard}>
            <span className={style.metricsLabel}>Vidas impactadas no projeto</span>
            <strong>{totalImpactedLives}</strong>
          </div>
        </div>

        <section className={style.metricsBlock}>
          <h3>Nomear líder do projeto</h3>
          <p className={style.tip}>
            A lista abaixo reúne os participantes vinculados ao projeto neste semestre para que o grupo possa escolher um líder.
          </p>

          {projectParticipants.length === 0 ? (
            <p className={style.tip}>Ainda não há participantes vinculados a este projeto para o semestre atual.</p>
          ) : (
            <>
              <ul className={style.metricsParticipantList}>
                {projectParticipants.map((participant) => (
                  <li key={getDocumentId(participant)}>
                    <span>{participant.username || participant.email || "Participante"}</span>
                    {getDocumentId(participant) === currentUserId ? <em>(você)</em> : null}
                  </li>
                ))}
              </ul>

              {leaderOptions.length === 0 ? (
                <p className={style.tip}>Não há outros participantes disponíveis para assumir a liderança.</p>
              ) : (
                <div className={style.metricsFormRow}>
                  <select
                    className={style.metricsSelect}
                    value={selectedLeaderId}
                    onChange={(e) => setSelectedLeaderId(e.target.value)}
                    disabled={leaderSaving}
                  >
                    <option value="">Selecione um participante</option>
                    {leaderOptions.map((participant) => (
                      <option key={participant.documentId || participant.id} value={participant.documentId || participant.id}>
                        {participant.username || participant.email}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={style.metricsButton}
                    onClick={handleSetLeader}
                    disabled={leaderSaving || !selectedLeaderId}
                  >
                    {leaderSaving ? "Salvando..." : "Definir líder"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className={style.metricsBlock}>
          <h3>Vidas impactadas por semestre</h3>
          <p className={style.tip}>
            Apenas o líder do projeto pode atualizar esse campo.
          </p>

          {!isProjectLeader ? (
            <p className={style.tip}>Somente o líder atual do projeto pode editar os valores.</p>
          ) : (projectDetails.semesters || []).length === 0 ? (
            <p className={style.tip}>Este projeto ainda não possui semestres cadastrados.</p>
          ) : (
            <div className={style.metricsSemesterList}>
              {(projectDetails.semesters || []).map((semester) => {
                const semesterKey = getDocumentId(semester);
                const draftValue = semesterDrafts[semesterKey] ?? String(semester.impactedLives ?? 0);

                return (
                  <div key={semesterKey} className={style.metricsSemesterCard}>
                    <div>
                      <strong>{semester.name}</strong>
                      {semester.year ? <p className={style.tip}>Ano: {semester.year}</p> : null}
                    </div>

                    <div className={style.metricsFormRow}>
                      <input
                        type="number"
                        min="0"
                        className={style.metricsInput}
                        value={draftValue}
                        onChange={(e) =>
                          setSemesterDrafts((prev) => ({
                            ...prev,
                            [semesterKey]: e.target.value,
                          }))
                        }
                        disabled={savingSemesterId === semesterKey}
                      />
                      <button
                        type="button"
                        className={style.metricsButton}
                        onClick={() => handleSaveSemesterImpact(semesterKey)}
                        disabled={savingSemesterId === semesterKey}
                      >
                        {savingSemesterId === semesterKey ? "Salvando..." : "Atualizar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {metricsMessage ? <p className={style.metricsMessage}>{metricsMessage}</p> : null}
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
          <button 
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${activeTab === "metrics" ? style.active : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            Métricas do Projeto
          </button>
        </div>

        <section className={style.content}>
          <div style={{ display: activeTab === "projects" ? "block" : "none" }} className="w3-container w3-padding-0">
            {renderProjectsTab()}
          </div>
          <div style={{ display: activeTab === "publications" ? "block" : "none" }} className="w3-container w3-padding-0">
            {renderPublicationsTab()}
          </div>
          <div style={{ display: activeTab === "metrics" ? "block" : "none" }} className="w3-container w3-padding-0">
            {renderMetricsTab()}
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

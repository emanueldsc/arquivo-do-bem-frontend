import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { InstitutionsManager } from "../InstitutionsManager";
import { ProjectsManager } from "../ProjectsManager";
import { PublicationsManager } from "../PublicationsManager";
import { SemestersManager } from "../SemestersManager";
import style from "../StudentDashboard/index.module.css";

export function ProfessorPanel() {
  const { user } = useAuth();
  const location = useLocation();
  
  const [selectedTab, setSelectedTab] = useState(
    location.state?.activeTab || "projects"
  );

  useEffect(() => {
    if (location.state?.activeTab) {
      setSelectedTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <>
      <div className={style.header}>
        <h2 className={style.headerTitle}>Painel do Professor</h2>
        <div className={style.userArea}>
          <span className={style.userName}>{user?.username}</span>
          <span className={style.userEmail}>{user?.email}</span>
        </div>
      </div>

      <section className={style.container}>
        <div className={`w3-bar w3-white ${style.tabBar}`}>
          <button
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${
              selectedTab === "institutions" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("institutions")}
          >
            Instituições
          </button>
          
          <button
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${
              selectedTab === "projects" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("projects")}
          >
            Projetos
          </button>
          
          <button
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${
              selectedTab === "semesters" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("semesters")}
          >
            Semestres
          </button>
          
          <button
            className={`w3-bar-item w3-button w3-hover-white ${style.tab} ${
              selectedTab === "publications" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("publications")}
          >
            Publicações
          </button>
        </div>

        <section className={style.content}>
          <div
            style={{ display: selectedTab === "institutions" ? "block" : "none" }}
            className="w3-container w3-padding-0"
          >
            <InstitutionsManager />
          </div>
          
          <div
            style={{ display: selectedTab === "projects" ? "block" : "none" }}
            className="w3-container w3-padding-0"
          >
            <ProjectsManager />
          </div>
          
          <div
            style={{ display: selectedTab === "semesters" ? "block" : "none" }}
            className="w3-container w3-padding-0"
          >
            <SemestersManager />
          </div>
          
          <div
            style={{ display: selectedTab === "publications" ? "block" : "none" }}
            className="w3-container w3-padding-0"
          >
            <PublicationsManager />
          </div>
        </section>
      </section>
    </>
  );
}
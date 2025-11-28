import style from "./ProfessorPanel.module.css";

import { InstitutionsManager } from "./InstitutionsManager";

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProjectsManager } from "./ProjectsManager";
import { SemestersManager } from "./SemestersManager";

export function ProfessorPanel() {
  const location = useLocation();
  const initialTabRef = useRef(null);

  if (initialTabRef.current === null) {
    initialTabRef.current =
      location.state?.activeTab ||
      localStorage.getItem("professorActiveTab") ||
      "institutions";
  }

  const [selectedTab, setSelectedTab] = useState(initialTabRef.current);

  useEffect(() => {
    localStorage.setItem("professorActiveTab", selectedTab);
  }, [selectedTab]);

  const { user } = useAuth();

  return (
    <>
      <div className={style.header}>
        <h2 className={style.headerTitle}>Painel do Administrador</h2>
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
        </div>

        <section className={style.content}>
          <div
            id="institutions"
            className="w3-container w3-padding-0"
            style={{
              display: selectedTab === "institutions" ? "block" : "none",
            }}
          >
            <InstitutionsManager />
          </div>

          <div
            id="projects"
            className="w3-container w3-padding-0"
            style={{ display: selectedTab === "projects" ? "block" : "none" }}
          >
            <ProjectsManager />
          </div>
          <div
            id="semesters"
            className="w3-container w3-padding-0"
            style={{ display: selectedTab === "semesters" ? "block" : "none" }}
          >
            <SemestersManager />
          </div>
        </section>
      </section>
    </>
  );
}

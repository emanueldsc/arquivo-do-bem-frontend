import { useState } from "react";
import style from "./ProfessorPanel.module.css";

import { InstitutionsManager } from "./InstitutionsManager";
import { ProjectManager } from "./ProjectManager";
import { StudentManager } from "./StudentManager";

import { useAuth } from '../context/AuthContext';

export function ProfessorPanel() {
  const [selectedTab, setSelectedTab] = useState("institution");
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
              selectedTab === "institution" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("institution")}
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
              selectedTab === "students" ? style.active : ""
            }`}
            onClick={() => setSelectedTab("students")}
          >
            Alunos
          </button>
        </div>

        <section className={style.content}>
          <div
            id="institution"
            className="w3-container w3-padding-0"
            style={{
              display: selectedTab === "institution" ? "block" : "none",
            }}
          >
            <InstitutionsManager />
          </div>

          <div
            id="projects"
            className="w3-container  w3-padding-0"
            style={{ display: selectedTab === "projects" ? "block" : "none" }}
          >
            <ProjectManager />
          </div>

          <div
            id="students"
            className="w3-container w3-padding-0"
            style={{ display: selectedTab === "students" ? "block" : "none" }}
          >
            <StudentManager />
          </div>
        </section>
      </section>
    </>
  );
}

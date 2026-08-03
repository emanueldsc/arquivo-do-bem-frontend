import ReactECharts from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import style from "./index.module.css";

function normalizeRelationList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (value?.data && typeof value.data === 'object') return [value.data];
  return [];
}

function normalizeUser(item) {
  const base = item?.attributes || item || {};
  return {
    id: item?.id || base.id,
    username: base.username || base.name || base.email || "Aluno",
    email: base.email || "",
  };
}

function normalizeSemester(item) {
  const base = item?.attributes || item || {};
  return {
    id: item?.id || base.id,
    name: base.name || base.title || "Semestre",
    year: base.year || "",
    impactedLives: Number(base.impacted_lives ?? base.impactedLives ?? 0),
  };
}

function normalizeProject(item) {
  const base = item?.attributes || item || {};
  const users = normalizeRelationList(base.users).map(normalizeUser);
  const semesters = normalizeRelationList(base.semesters).map(normalizeSemester);

  return {
    id: item?.id || base.id,
    name: base.name || "Projeto sem nome",
    isActive: base.is_active !== false,
    maxStudents: Number(base.max_students ?? base.maxStudents ?? 0),
    users,
    semesters,
  };
}

function normalizeInstitution(item) {
  const base = item?.attributes || item || {};
  const projects = normalizeRelationList(base.projects).map(normalizeProject);

  return {
    id: item?.id || base.id,
    name: base.name || "Instituição sem nome",
    projects,
  };
}

function getSemesterKey(semester) {
  const parts = [];
  if (semester?.name) parts.push(semester.name);
  if (semester?.year) parts.push(String(semester.year));
  return parts.length ? parts.join("/") : "Semestre";
}

function sortSemesterKeys(labels) {
  return [...labels].sort((left, right) => {
    const leftParts = left.split("/");
    const rightParts = right.split("/");
    const leftYear = Number(leftParts[leftParts.length - 1]);
    const rightYear = Number(rightParts[rightParts.length - 1]);
    if (!Number.isNaN(leftYear) && !Number.isNaN(rightYear) && leftYear !== rightYear) {
      return leftYear - rightYear;
    }
    return left.localeCompare(right);
  });
}

export function PublicMetrics() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          "/api/institutions?populate[projects][populate][0]=users&populate[projects][populate][1]=semesters&populate[projects][fields][0]=name&populate[projects][fields][1]=max_students&populate[projects][fields][2]=is_active&sort=name:asc"
        );

        const list = (res.data?.data || []).map(normalizeInstitution);
        setInstitutions(list);
      } catch (err) {
        console.error("Erro ao carregar métricas públicas:", err);
        setError("Não foi possível carregar os dados públicos neste momento.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const institutionStats = institutions.map((institution) => {
      const activeProjects = institution.projects.filter((project) => project.isActive);
      const totalStudents = activeProjects.reduce((sum, project) => sum + project.users.length, 0);
      const impactLives = activeProjects.reduce(
        (sum, project) =>
          sum + project.semesters.reduce((semesterSum, semester) => semesterSum + semester.impactedLives, 0),
        0
      );

      return {
        name: institution.name,
        projects: activeProjects.length,
        students: totalStudents,
        impactedLives: impactLives,
      };
    });

    const allSemesterKeys = sortSemesterKeys(
      [...new Set(institutions.flatMap((institution) =>
        institution.projects.flatMap((project) =>
          project.semesters.map((semester) => getSemesterKey(semester))
        )
      ))]
    );

    const impactedByInstitution = institutionStats.map((item) => ({
      name: item.name,
      data: allSemesterKeys.map((key) => {
        const total = institutions
          .find((institution) => institution.name === item.name)
          ?.projects.reduce((sum, project) => {
            const semesterValue = project.semesters.find((semester) => getSemesterKey(semester) === key);
            return sum + (semesterValue?.impactedLives || 0);
          }, 0) || 0;
        return total;
      }),
    }));

    const globalImpactedBySemester = allSemesterKeys.map((key) => {
      const total = institutions.reduce((sum, institution) => {
        const value = institution.projects.reduce((projectSum, project) => {
          const semesterValue = project.semesters.find((semester) => getSemesterKey(semester) === key);
          return projectSum + (semesterValue?.impactedLives || 0);
        }, 0);
        return sum + value;
      }, 0);
      return total;
    });

    const globalStudentsBySemester = allSemesterKeys.map((key) => {
      const total = institutions.reduce((sum, institution) => {
        const value = institution.projects.reduce((projectSum, project) => {
          const matchingSemester = project.semesters.find((semester) => getSemesterKey(semester) === key);
          return projectSum + (matchingSemester ? project.users.length : 0);
        }, 0);
        return sum + value;
      }, 0);
      return total;
    });

    return {
      institutionStats,
      allSemesterKeys,
      impactedByInstitution,
      globalImpactedBySemester,
      globalStudentsBySemester,
    };
  }, [institutions]);

  const studentsPieOption = {
    legend: {
      top: "bottom",
      left: "center",
      padding: [0, 0, 24, 0],
      textStyle: { fontSize: 12 },
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: [50, 250],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        data: stats.institutionStats.map((item) => ({
          value: item.students,
          name: item.name,
        })),
      },
    ],
  };

  const impactedAreaOption = {
    tooltip: { trigger: "axis" },
    legend: { top: 0 },
    xAxis: { type: "category", data: stats.allSemesterKeys },
    yAxis: { type: "value" },
    series: [
      {
        name: "Vidas impactadas (global)",
        type: "line",
        smooth: true,
        areaStyle: {},
        data: stats.globalImpactedBySemester,
      },
    ],
  };

  const studentsLineOption = {
    tooltip: { trigger: "axis" },
    legend: { top: 0 },
    xAxis: { type: "category", data: stats.allSemesterKeys },
    yAxis: { type: "value" },
    series: [
      {
        name: "Alunos por semestre",
        type: "line",
        smooth: true,
        data: stats.globalStudentsBySemester,
      },
    ],
  };

  return (
    <section className={style.page}>
      <header className={style.hero}>
        <div>
          <p className={style.eyebrow}>Painel público</p>
          <h1>Indicadores do Arquivo do Bem</h1>
          <p className={style.subtitle}>
            Visão pública das instituições, projetos, alunos e impacto das ações de extensão ao longo dos semestres.
          </p>
        </div>
      </header>

      {loading ? (
        <p className={style.state}>Carregando indicadores públicos...</p>
      ) : error ? (
        <p className={style.state}>{error}</p>
      ) : (
        <>
          <div className={style.summaryGrid}>
            <article className={style.summaryCard}>
              <span>Instituições</span>
              <strong>{stats.institutionStats.length}</strong>
            </article>
            <article className={style.summaryCard}>
              <span>Projetos ativos</span>
              <strong>{stats.institutionStats.reduce((sum, item) => sum + item.projects, 0)}</strong>
            </article>
            <article className={style.summaryCard}>
              <span>Alunos vinculados</span>
              <strong>{stats.institutionStats.reduce((sum, item) => sum + item.students, 0)}</strong>
            </article>
            <article className={style.summaryCard}>
              <span>Vidas impactadas</span>
              <strong>{stats.institutionStats.reduce((sum, item) => sum + item.impactedLives, 0)}</strong>
            </article>
          </div>

          <div className={style.grid}>
            <article className={style.card}>
              <h2>Vidas impactadas por semestre</h2>
              <ReactECharts option={impactedAreaOption} style={{ height: 340 }} />
            </article>
          </div>

          <div className={style.grid}>
            <article className={style.card}>
              <h2>Alunos por instituição</h2>
              <ReactECharts option={studentsPieOption} style={{ height: 320 }} />
            </article>

            <article className={style.card}>
              <h2>Total de alunos por semestre</h2>
              <ReactECharts option={studentsLineOption} style={{ height: 340 }} />
            </article>
          </div>
        </>
      )}
    </section>
  );
}

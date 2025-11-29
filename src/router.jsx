import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { InstitutionEditorPage } from "./pages/InstitutionEditorPage";
import { InstitutionPage } from "./pages/InstitutionPage";
import { ProfessorPanel } from "./pages/ProfessorPanel";
import { ProjectEditorPage } from "./pages/ProjectEditorPage";
import { ProjectPage } from "./pages/ProjectPage";
import RegisterProfessor from "./pages/RegisterProfessor";
import { Repository } from "./pages/Repository";
import { StudentPanel } from "./pages/StudentPanel";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "repositorio",
        element: <Repository />,
      },
      {
        path: "professor",
        element: <ProfessorPanel />,
      },
      {
        path: "aluno",
        element: <StudentPanel />,
      },
      {
        path: "professor/instituicoes/nova",
        element: <InstitutionEditorPage />,
      },
      {
        path: "professor/instituicoes/:id/editar",
        element: <InstitutionEditorPage />,
      },
      {
        path: "professor/projetos/novo",
        element: <ProjectEditorPage />,
      },
      {
        path: "professor/projetos/:id/editar",
        element: <ProjectEditorPage />,
      },
      {
        path: "projetos/:slug",
        element: <ProjectPage />,
      },
      {
        path: "/institutions/:slug",
        element: <InstitutionPage />,
      },
    ],
  },
  {
    path: "register-professor",
    element: <RegisterProfessor />,
  },
]);

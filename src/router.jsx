import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Page } from "./pages/Page";
import { Home } from "./pages/Home";
import { Repository } from "./pages/Repository";
import { ProjectManager } from "./pages/ProjectManager";
import { ProfessorPanel } from "./pages/ProfessorPainel";
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
        element: <Repository />
      },
      {
        path: "gestao",
        element: <ProjectManager />,
      },
      {
        path: "professor",
        element: <ProfessorPanel />,
      },
      {
        path: "aluno",
        element: <StudentPanel />,
      },
    ],
  },
]);

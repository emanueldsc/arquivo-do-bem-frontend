import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ProfessorPanel } from "./pages/ProfessorPanel";
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
        element: <Repository />
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

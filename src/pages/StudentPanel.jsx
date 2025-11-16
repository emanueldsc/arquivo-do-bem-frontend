import style from "./StudentPanel.module.css";

export function StudentPanel() {
  const rows = fakeData;

  return (
    <section className="container">
      <section className={style.header}>
        <h1>Gestão de Projetos</h1>

        <p>Crie, edite ou exlua projetos (area administrativa).</p>

        <h2>Lista de projetos</h2>
      </section>

      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Função</th>
              <th>Status</th>
              <th>Semes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                <td>{row.title}</td>
                <td>{row.description}</td>
                <td>{row.status}</td>
                <td>{row.data}</td>
                <td className={style.btnContainer}>
                  <button className="btn btn-edit">Editar</button> 
                  <button className="btn btn-remove">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="footer">
        <h2>Criar / Editar Projeto</h2>
      </section>
    </section>
  );
}

const fakeData = [
  {
    title: "Reunião com equipe",
    description: "Planejar o sprint da próxima semana",
    status: "pendente",
    data: "2025-11-18",
  },
  {
    title: "Entregar relatório mensal",
    description: "Relatório de desempenho do projeto Alpha",
    status: "em andamento",
    data: "2025-11-20",
  },
  {
    title: "Revisão de código",
    description: "Revisar pull requests da branch develop",
    status: "concluído",
    data: "2025-11-15",
  },
  {
    title: "Atualizar documentação",
    description: "Documentar novas APIs REST",
    status: "pendente",
    data: "2025-11-22",
  },
  {
    title: "Testes de integração",
    description: "Executar suite completa de testes automatizados",
    status: "em andamento",
    data: "2025-11-16",
  },
];

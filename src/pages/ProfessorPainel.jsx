import style from './ProfessorPanel.module.css'

export function ProfessorPanel() {
  const rows = fakeData;

  return (
    <section className="container">
      <section className="header">
        <h1>Gestão de Projetos</h1>

        <p>Crie, edite ou exlua projetos (area administrativa).</p>

        <h2>Lista de projetos</h2>
      </section>

      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Aluno</th>
              <th>Status</th>
              <th>Semestre</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                <td>{row.project}</td>
                <td>{row.students.join(', ')}</td>
                <td>{row.status}</td>
                <td>{row.semester}</td>
                <td>
                  <button className="btn">Avaliar</button>
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
    "project": "Project A",
    "students": ["John Doe", "Jane Smith"],
    "status": "Active",
    "semester": "2025-1"
  },
  {
    "project": "Project B",
    "students": ["Alice Brown", "Bob Wilson"],
    "status": "Completed",
    "semester": "2024-2"
  },
  {
    "project": "Project C",
    "students": ["Emma Davis", "Liam Johnson"],
    "status": "Pending",
    "semester": "2025-1"
  }
];

import style from "./Repository.module.css";

export function Repository() {
  const rows = fakeData;

  return (
    <div className="container">
      <section className="header">
        <h2>Repositório de Arquivos</h2>
      </section>
      <section className="table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Autor</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.author}</td>
                <td>{row.date}</td>
                <td>
                  <button className="btn">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="footer">
        <h3>Enviar arquivo (professor)</h3>
        <div>
          <label htmlFor="file">Arquivo</label>
          <input type="file" name="file" id="file" />
        </div>

        <div>
          <label htmlFor="description">Descrição</label>
          <input type="text" name="description" id="description" />
        </div>
      </section>
    </div>
  );
}

const fakeData = [
  {
    name: "Relatório trimestral.pdf",
    type: "PDF",
    author: "Prof. Ana",
    date: "2025-09-02",
  },
  {
    name: "Dados CNES.csv",
    type: "CSV",
    author: "Equipe TI",
    date: "2025-09-15",
  },
];

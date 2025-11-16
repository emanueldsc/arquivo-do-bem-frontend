import { InstitutionalCard } from "../components/InstitutionalCard";
import style from "./Home.module.css";

export function Home() {
  return (
    <div className={style.home}>
      <section className={style.header}>
        <h2>Projetos em destaque</h2>
        <p>Intituições atendidas 22 Projetos cadastrados 100</p>
      </section>
      <section className={style.content}>
        {dadosDeTeste.map((item) => (
          <InstitutionalCard key={item.id} item={item} />
        ))}
      </section>
      <section className={style.sidebar}>
        <div className={style.filter}>
          <h4>Filtros</h4>
          <form>
            <div>
              <label>Intituições</label>
              <select></select>
            </div>
            <div>
              <label>Projetos</label>
              <select></select>
            </div>
          </form>
        </div>
        <div className={style.lastUpload}>
          <h4>Últimos uploads</h4>
          <ul>
            <li>Relatório trimestral • 2 dias</li>
            <li>Dados CNES atualizados • 4 dias</li>
            <li>Manual do professor • 1 semana</li>
          </ul>
        </div>
      </section>
    </div>
  );
}


  const dadosDeTeste = [
    {
      id: "a1",
      title: "Postagem 1: Explorando React",
      content:
        "React torna a criação de UIs interativas muito simples. Crie views simples para cada estado da sua aplicação.",
    },
    {
      id: "b2",
      title: "Postagem 2: Componentes Reutilizáveis",
      content:
        "Construa componentes encapsulados que gerenciam seu próprio estado e, em seguida, componha-os para criar UIs complexas.",
    },
    {
      id: "c3",
      title: 'Postagem 3: A Prop "key"',
      content:
        'A "key" é essencial em listas. Ela ajuda o React a identificar quais itens mudaram, foram adicionados ou removidos.',
    },
    {
      id: "d4",
      title: "Postagem 4: O que são Hooks?",
      content:
        'Hooks são funções que permitem "enganchar" o estado e os recursos do ciclo de vida do React em componentes de função.',
    },
    {
      id: "e5",
      title: "Postagem 5: useState",
      content:
        "O Hook useState permite adicionar estado local a componentes de função. Ele retorna um par: o valor do estado atual e uma função para atualizá-lo.",
    },
    {
      id: "f6",
      title: "Postagem 6: useEffect",
      content:
        "O Hook useEffect permite executar efeitos colaterais em componentes de função, como buscar dados, definir assinaturas ou manipular o DOM.",
    },
    {
      id: "g7",
      title: "Postagem 7: Renderização Condicional",
      content:
        'Use operadores JavaScript como "if" ou o operador ternário para renderizar diferentes elementos com base no estado.',
    },
    {
      id: "h8",
      title: "Postagem 8: Roteamento com React Router",
      content:
        "Para aplicações de página única (SPAs), o React Router é a biblioteca padrão para gerenciar a navegação.",
    },
    {
      id: "i9",
      title: "Postagem 9: Gerenciamento de Estado",
      content:
        "Para estados globais, Context API é uma solução nativa, mas Redux e Zustand também são muito populares.",
    },
    {
      id: "j10",
      title: "Postagem 10: Testando Componentes",
      content:
        "Jest e React Testing Library (RTL) formam uma dupla poderosa para testar o comportamento dos seus componentes.",
    },
    {
      id: "k11",
      title: "Postagem 11: TypeScript em React",
      content:
        "Adicionar TypeScript ao seu projeto React pode ajudar a capturar bugs mais cedo e melhorar a manutenibilidade do código.",
    },
    {
      id: "l12",
      title: "Postagem 12: Styled Components",
      content:
        "Uma biblioteca popular de CSS-in-JS que permite escrever CSS real para estilizar seus componentes.",
    },
    {
      id: "m13",
      title: "Postagem 13: Otimização de Performance",
      content:
        'Use "memo", "useCallback" e "useMemo" para evitar renderizações desnecessárias e otimizar sua aplicação.',
    },
    {
      id: "n14",
      title: "Postagem 14: Next.js",
      content:
        "Um framework React que oferece renderização do lado do servidor (SSR) e geração de sites estáticos (SSG) prontos para produção.",
    },
    {
      id: "o15",
      title: "Postagem 15: Finalizando a Lista",
      content:
        "Este é o último item do nosso array de dados de teste. Foi fácil iterar sobre ele!",
    },
  ];
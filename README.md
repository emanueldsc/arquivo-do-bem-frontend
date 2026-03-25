# Arquivo do Bem - Frontend

Este é o projeto frontend da aplicação **Arquivo do Bem**, construído com React e Vite.

---

## ⚠️ Pré-requisito Importante: Backend

**Antes de rodar o frontend, é obrigatório que o backend já esteja configurado e rodando localmente!**
A aplicação frontend depende da API (Strapi) para funcionar corretamente. 

👉 **Se você ainda não iniciou o backend:** Vá para a pasta `arquivo-do-bem-strapi` e siga as instruções no arquivo `README.md` correspondente. Lá estarão descritos os passos para subir o banco de dados (PostgreSQL via Docker), instalar as dependências e iniciar o servidor Strapi.

---

## 🚀 Como executar o Frontend localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina. Apenas inicie essa etapa após confirmar que o seu backend está acessível e rondando no painel.

1. **Clone o repositório e acesse a pasta do frontend:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd arquivo-do-bem-frontend
   ```
   *(Substitua `<URL_DO_REPOSITORIO>` pelo endereço do seu projeto)*

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *Isso irá baixar todos os pacotes necessários.*

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação no navegador:**
   Após a execução do comando, o terminal exibirá o endereço local (geralmente `http://localhost:5173`). Abra o link no navegador para visualizar a plataforma e começar a interagir!

---

## 🛠️ Simulando o Ambiente de Produção Localmente

Caso você queira testar a aplicação localmente utilizando as configurações e otimizações de **produção** (lembrando que nesse caso o `import.meta.env.PROD` retorna `true` e `DEV` retorna `false`), não utilize o comando padrão de desenvolvimento.

Você possui duas opções para simular a produção:

### Opção 1: Comando Unificado (Prático)
A forma mais ágil é utilizar o nosso script customizado que faz a compilação e sobe o servidor de testes de uma só vez:
```bash
npm run prod
```

### Opção 2: Passo a Passo Manual
Se você quiser ter o controle para debugar o processo, execute separadamente:

1. **Gere o Build:**
   ```bash
   npm run build
   ```
   *Isso compilará todos os seus arquivos otimizados na pasta `dist`.*

2. **Inicie o Servidor de Preview:**
   ```bash
   npm run preview
   ```
   *O servidor local lerá a versão final a partir da porta `4173`.*

Em ambos os casos, ao acessar `http://localhost:4173`, você estará interagindo com a exata versão final da plataforma consumindo a URL oficial do backend configurada no `api.js`!

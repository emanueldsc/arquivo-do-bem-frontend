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

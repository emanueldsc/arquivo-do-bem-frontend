# Dockerfile na pasta 'frontend'
FROM node:20 as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa de Servidor (opcional, mas mais limpa)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
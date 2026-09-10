FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias para compilar SQLite nativo si hiciera falta
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001

CMD ["npx", "ts-node", "src/index.ts"]

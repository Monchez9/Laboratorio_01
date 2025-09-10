# Etapa 1: Build y test
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY eslint.config.ts ./

RUN npm ci

COPY src/ ./src
COPY tests/ ./tests

RUN npm run test

RUN npm run build

# Etapa 2: Producción
FROM node:22-slim AS production

WORKDIR /app

COPY --from=builder ./package*.json ./
COPY --from=builder ./dist ./dist

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
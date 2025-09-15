# ===== Etapa 1: Build + Test =====
FROM node:22 AS builder
WORKDIR /app

# 1) Dependencias (capa cacheable)
COPY package*.json ./
RUN npm ci

# 2) Config + código (usa nombres EXACTOS de tu repo)
COPY tsconfig.json ./
COPY jest.config.cjs ./        
# Si necesitas ESLint en el build, descomenta la línea de abajo:
# COPY eslint.config.ts ./
COPY src/ ./src
COPY tests/ ./tests
# Si tus pruebas usan datos o reports, súmalos:
# COPY data/ ./data
# COPY reports/ ./reports

# 3) Pruebas (opcional: comenta esta línea si no quieres test en el build)
RUN npm test

# 4) Compilación y poda de dev-deps
RUN npm run build
RUN npm prune --omit=dev

# ===== Etapa 2: Runtime (producción) =====
FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Solo lo necesario para ejecutar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]

# ── Stage 1: Generate Prisma client ───────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"
RUN npx prisma generate

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/generated ./generated
COPY src ./src
COPY tsconfig.json ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

CMD ["npx", "tsx", "src/index.ts"]

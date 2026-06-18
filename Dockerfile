# syntax=docker/dockerfile:1

# Bun ставит зависимости (быстро, по bun.lock); сборка и рантайм — на Node,
# т.к. `next build` (Turbopack-воркеры) не работает под Bun.
ARG BUN_VERSION=1.2.18-alpine
ARG NODE_VERSION=22-alpine

# 1. Полный набор зависимостей — для сборки
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Сборка приложения на Node
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node_modules/.bin/next build

# 3. Только прод-зависимости — меньше пакетов в рантайме = меньше CVE-поверхность
FROM oven/bun:${BUN_VERSION} AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 4. Рантайм на Node. Bun здесь не годится: Turbopack-вывод Next 16 на каждом
#    запросе зовёт markAsUncloneable (worker_threads/structuredClone), которого
#    нет в Bun 1.2.18 — сервер стартует, но падает на любом рендере.
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# корневые сертификаты для TLS к api.met.no / yr.no (GigaChat использует свой CA из кода)
RUN apk add --no-cache ca-certificates && update-ca-certificates

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package.json next.config.ts ./
# OG-картинки читают эти шрифты с диска от cwd в рантайме
COPY --from=builder /app/src/shared/og/Inter-Regular.ttf /app/src/shared/og/Inter-ExtraBold.ttf ./src/shared/og/

# каталог рантайм-данных админки/аналитики (монтируется томом); отдаём владение non-root
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]

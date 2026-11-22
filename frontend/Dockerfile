# syntax=docker/dockerfile:1
# Frontend image for the k8s deployment (infra/k8s/frontend-deployment.yaml)
# and the optional `frontend-preview` compose service.
# Multi-stage: install deps, build the Next.js app, ship a slim runtime.

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `public/` is optional in Next.js; create it so the runtime COPY always resolves.
RUN mkdir -p public
# Public env vars are inlined at build time; pass the API origin per environment.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user so the web server never holds root.
RUN addgroup -S -g 1001 app \
  && adduser -S -u 1001 -G app app \
  && chown app:app /app

COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public

USER app
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=12 --start-period=25s \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null 2>&1 || exit 1
CMD ["node", "server.js"]

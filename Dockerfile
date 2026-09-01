FROM node:20-alpine AS builder

WORKDIR /app

# Force development mode during builder stage so devDependencies (Vite, TypeScript, esbuild) are installed even if Coolify passes NODE_ENV=production at build time
ENV NODE_ENV=development

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy lockfile and package declaration
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile --prod=false

# Copy application source
COPY . .

# Build frontend and server bundle
RUN pnpm build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files and install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled dist bundle and db directory
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db ./db

EXPOSE 3000

CMD ["node", "dist/index.js"]

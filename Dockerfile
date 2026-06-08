# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: custom generated client (output = "../app/generated/prisma")
COPY --from=builder /app/app/generated ./app/generated
# Prisma: generated query engine for the client at runtime
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# mssql driver adapter (used by lib/prisma.ts at runtime)
COPY --from=builder /app/node_modules/mssql ./node_modules/mssql
COPY --from=builder /app/node_modules/tedious ./node_modules/tedious

USER nextjs
EXPOSE 3000

# The database schema is provisioned separately (prisma db push). Start the server.
CMD ["node", "server.js"]

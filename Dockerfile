# Use Node.js 20 as the base image
FROM node:20-slim AS base

# Install pnpm and other build dependencies
RUN npm install -g pnpm

# --- Dependency Stage ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the frontend and backend
RUN pnpm build

# --- Production Stage ---
FROM node:20-slim AS runner
WORKDIR /app

# Install production dependencies only
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copy build artifacts and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the application port
EXPOSE 8080

# Run the migration and start the server
CMD ["pnpm", "start"]

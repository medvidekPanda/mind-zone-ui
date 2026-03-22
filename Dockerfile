# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Install build tools if needed
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:dev

# Compile proxy TypeScript to JavaScript (esbuild available via Angular)
RUN npx esbuild proxy/proxy-server.mts --format=esm --platform=node --packages=external --outfile=proxy/proxy-server.mjs

# Prune devDependencies for production
RUN npm prune --omit=dev

# Stage 2: Runner
FROM node:22-slim AS mind-zone-ui

WORKDIR /app

ENV NODE_ENV=development
ENV INSTANCES=2
ENV PORT=80
ENV API_URL=http://localhost:3001

# Copy built application and pruned node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proxy ./proxy

# Verify the existence of the dist folder
RUN ls -la dist/mind-zone-ui/browser && ls -la dist/mind-zone-ui/server

EXPOSE 80

# Start with node directly (proxy compiled to JS in build stage)
CMD ["node", "proxy/proxy-server.mjs"]

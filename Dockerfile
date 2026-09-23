# -------------------------------
# 1️⃣ Dependencies stage
# -------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force


# -------------------------------
# 2️⃣ Production stage
# -------------------------------
FROM node:22-alpine

WORKDIR /app

# Set runtime env
ENV NODE_ENV=production
ENV PORT=5001

# Copy package manifests (useful for tooling / inspection)
COPY package*.json ./

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (no build step — plain Express)
COPY server.js ./
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes

# Expose port
EXPOSE 5001

# Drop privileges
USER node

# Start server
CMD ["node", "server.js"]

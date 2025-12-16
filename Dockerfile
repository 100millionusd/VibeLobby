# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy package.json and install ONLY production dependencies
COPY package*.json ./
# We need to install dependencies including express, cors, etc.
# Since we mixed dev/prod deps in package.json, we'll just install all for safety in this setup,
# or ideally we should have separated them. For now, npm install is safest.
RUN npm install

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Expose port 8080 (Cloud Run default)
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server/index.js"]

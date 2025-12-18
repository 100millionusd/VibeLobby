# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build Arguments (passed from Cloud Run / Cloud Build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DUFFEL_PUBLIC_KEY
ARG VITE_WEB3AUTH_CLIENT_ID
ARG VITE_DUFFEL_CHECKOUT_URL

# Set as ENV so Vite can see them during build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_DUFFEL_PUBLIC_KEY=$VITE_DUFFEL_PUBLIC_KEY
ENV VITE_WEB3AUTH_CLIENT_ID=$VITE_WEB3AUTH_CLIENT_ID
ENV VITE_DUFFEL_CHECKOUT_URL=$VITE_DUFFEL_CHECKOUT_URL

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

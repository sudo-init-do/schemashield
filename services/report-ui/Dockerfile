# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source files
COPY . .

# Set API base environment variable
ARG VITE_API_BASE=http://localhost:8080
ENV VITE_API_BASE=${VITE_API_BASE}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built files
COPY --from=build /app/dist .

# Configure nginx for SPA routing and API proxy
RUN printf 'server { \
  listen 80; \
  \
  # Serve static files \
  location / { \
    try_files $uri $uri/ /index.html; \
    add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    add_header Pragma "no-cache"; \
    add_header Expires "0"; \
  } \
  \
  # Proxy API requests to core-api \
  location /api/ { \
    proxy_pass http://core-api:8080/; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    proxy_set_header X-Forwarded-Proto $scheme; \
  } \
} ' > /etc/nginx/conf.d/default.conf

EXPOSE 80

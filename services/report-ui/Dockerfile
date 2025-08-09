# build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
ARG VITE_API_BASE=http://localhost:8080
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# small nginx tweak to handle client-side routing (not needed here, but nice)
RUN printf 'server { \
  listen 80; \
  location / { try_files $uri /index.html; } \
} ' > /etc/nginx/conf.d/default.conf

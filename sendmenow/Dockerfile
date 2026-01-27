# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /build

# Dépendances
COPY package*.json ./
RUN npm install

# Code source React
COPY public ./public
COPY src ./src

# Build React
RUN npm run build

# ---------- Production ----------
FROM nginx:alpine

# Config nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ CRA = build | Vite = dist
COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /build

# Copier les fichiers package
COPY package*.json ./

RUN npm install

# Copier le code source
COPY public ./public
COPY src ./src

# Build frontend
RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le résultat du build
# ⚠️ adapte si Vite => dist
COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
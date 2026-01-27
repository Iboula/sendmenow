# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /build

# DEBUG: Afficher le PWD et le contenu du contexte
RUN echo "=== PWD actuel ===" && pwd
RUN echo "=== Contenu de / ===" && ls -la / || true
RUN echo "=== Contenu du contexte (devrait montrer package.json, public, src) ===" && ls -la . || true

# Copier les fichiers package (chemins relatifs depuis sendmenow/)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source (chemins relatifs)
COPY public ./public
COPY src ./src

# Build frontend (React / Vite / CRA)
RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# Copier la configuration Nginx (chemin relatif)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=builder /build/build /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

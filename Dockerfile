# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /build

# DEBUG: Afficher le contenu de la racine du contexte avant toute commande COPY
RUN echo "=== PWD actuel ===" && pwd
RUN echo "=== Contenu de / ===" && ls -la / || true
RUN echo "=== Recherche de sendmenow ===" && find / -name "sendmenow" -type d 2>/dev/null || echo "Aucun dossier sendmenow trouve"
RUN echo "=== Contenu du build context (devrait etre dans /) ===" && ls -la /workspace 2>/dev/null || ls -la /app 2>/dev/null || echo "Pas de workspace ou app"

# Copier les fichiers package
COPY sendmenow/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY sendmenow/public ./public
COPY sendmenow/src ./src

# Build frontend (React / Vite / CRA)
RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# Copier la config nginx
COPY sendmenow/nginx.conf /etc/nginx/conf.d/default.conf

# Copier le résultat du build
# (⚠️ le dossier est généralement /build/build)
COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

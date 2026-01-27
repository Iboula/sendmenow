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

# DEBUG: Vérifier avant COPY public
RUN echo "=== Recherche de 'public' dans le système ===" && find / -name "public" -type d 2>/dev/null | head -10 || echo "Aucun dossier public trouvé"

# Copier le code source (chemins relatifs)
# COPY public ./public
# COPY src ./src

# DEBUG: Afficher ce qui devrait être copié
RUN echo "=== Liste des fichiers après npm install ===" && ls -laR . | head -50

# Build frontend (React / Vite / CRA)
# RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# DEBUG STAGE 2
RUN echo "=== Stage 2: Production ===" && ls -la /

# Copier la configuration Nginx (chemin relatif)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
# COPY --from=builder /build/build /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

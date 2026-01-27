FROM node:18-alpine AS builder
WORKDIR /build

# DEBUG: Afficher le PWD et le contenu
RUN echo "=== PWD actuel ===" && pwd
RUN echo "=== Contenu de / ===" && ls -la /
RUN echo "=== Contenu de /build (PWD) ===" && ls -la .
RUN echo "=== Recherche de public et src ===" && find / -name "public" -o -name "src" 2>/dev/null | head -20

# COPY package*.json ./
RUN echo "=== Tentative de lister package.json dans le contexte ===" && ls -la package*.json 2>&1 || echo "package.json non trouvé"

RUN npm install --production || echo "npm install skipped"

# COPY public ./public
# COPY src ./src

RUN echo "=== Contenu après npm install ===" && ls -laR . | head -50

# RUN npm run build

FROM nginx:alpine

RUN echo "=== Stage 2: Nginx ===" && ls -la /

# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Frontend pour Railway
FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files
COPY sendmenow/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY sendmenow/public/ ./public/
COPY sendmenow/src/ ./src/

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY sendmenow/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

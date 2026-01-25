# Frontend Dockerfile for Railway deployment
FROM node:18-alpine AS builder

WORKDIR /app/sendmenow

# Copy package files
COPY sendmenow/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY sendmenow/public/ ./public/
COPY sendmenow/src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY sendmenow/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/sendmenow/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

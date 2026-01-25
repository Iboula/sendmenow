# Backend Dockerfile for SendMeNow Server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY *.js ./
COPY utils/ ./utils/
COPY templates/ ./templates/
COPY examples/ ./examples/

# Create uploads directory for file storage
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose the server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]

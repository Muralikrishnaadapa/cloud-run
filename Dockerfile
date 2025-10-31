# Use official Node.js 22 image
FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production

# Copy app source code
COPY . .

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

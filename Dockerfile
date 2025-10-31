# Use official Node.js runtime
FROM node:22-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy all source files
COPY . .

# Expose the port Cloud Run uses
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]

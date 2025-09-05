# Use official Node.js LTS Alpine 
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port (default 5000, can be overridden by env)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
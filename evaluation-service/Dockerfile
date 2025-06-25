FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies, including dev dependencies like nodemon
RUN npm install

# Copy the rest of the application code
COPY . .

# Install the Docker command-line tool
RUN apk add --no-cache docker-cli

# Use nodemon to run the app
CMD ["npx", "nodemon", "index.js"]
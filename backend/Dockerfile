FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend source
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the NestJS port
EXPOSE 3001

# Start in production mode
CMD ["npm", "run", "start:prod"]

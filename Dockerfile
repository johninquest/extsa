FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Your app binds to port 3000
EXPOSE 3000

# Use nodemon to run the app in development mode
CMD ["npx", "nodemon", "dist/server.js"]
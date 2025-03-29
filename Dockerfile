FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Create an entrypoint script
RUN echo '#!/bin/sh' > /usr/src/app/docker-entrypoint.sh && \
    echo 'npx sequelize-cli db:migrate' >> /usr/src/app/docker-entrypoint.sh && \
    echo 'npx nodemon dist/server.js' >> /usr/src/app/docker-entrypoint.sh && \
    chmod +x /usr/src/app/docker-entrypoint.sh

# Your app binds to port 3000
EXPOSE 3000

# Use the entrypoint script
CMD ["/usr/src/app/docker-entrypoint.sh"]
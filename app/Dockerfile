FROM node:16.13.0-alpine
WORKDIR ./
COPY package.json package-lock.json server.js ./
RUN npm install --verbose --foreground-scripts @sentry/profiling-node
RUN npm install
COPY server.js ./dist/src/server.js
CMD node ./dist/src/server.js
EXPOSE 3000
FROM arm64v8/node:%%NODE_VERSION%%-alpine

WORKDIR /build
COPY . .

RUN apk add --no-cache build-base python3 g++ make curl
RUN mkdir lib

RUN npm ci --ignore-scripts
RUN npm run build:configure
RUN TARGET_DIR=./arm64 npm run build:bindings

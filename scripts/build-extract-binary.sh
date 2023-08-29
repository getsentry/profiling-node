#!/bin/bash

# Run this on a Mac with M1 chip to build the native bindings for arm64
source ~/.nvm/nvm.sh
versions=(16 18 20);
for i in "${!versions[@]}";
do
    npm run build:configure
    nvm use ${versions[$i]}
    TARGET_DIR=./arm64 npm run build:bindings
done

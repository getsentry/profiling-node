
versions=(14 16 18 20);
# abi=(83 93 108 115);

# template="`cat Docker/Dockerfile`"

# function cleanup {
#     echo "$template" > Docker/Dockerfile
# }

# trap cleanup EXIT

for i in "${!versions[@]}";
do
#     v=${versions[$i]}
#     a=${abi[$i]}

#     sed -i '' 's/%%NODE_VERSION%%/'"$v"'/g' Docker/Dockerfile

#     docker build -t node -f ./Docker/Dockerfile .
#     docker container create --name node node
#     docker container cp node:/build/arm64 ./
#     docker container rm node

#     echo "$template" > Docker/Dockerfile
    npm run build:configure
    nvm use ${versions[$i]}
    TARGET_DIR=./arm64 npm run build:bindings
done

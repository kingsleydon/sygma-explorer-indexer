docker build -t kdon1204/sygma-explorer-api -f ./Dockerfile.api .
docker build -t kdon1204/sygma-explorer-indexer .
docker push kdon1204/sygma-explorer-api
docker push kdon1204/sygma-explorer-indexer

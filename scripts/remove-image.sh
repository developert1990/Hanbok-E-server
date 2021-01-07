docker rm -f $(docker ps | grep hanbok-server | awk '{print $1}')
docker rmi -f $(docker images | grep hanbok-server | awk '{print $3}')
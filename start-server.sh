APPVERSION=$(git rev-parse --short HEAD)
echo 'Start '$(date +%Y%m%d%H%M%S)' version='$APPVERSION
npm run start
echo 'Stop '$(date +%Y%m%d%H%M%S)

npm run build
echo '{"date": "'$(date +%F)'"}' > deployment.json
zip -j function.zip dist/index.mjs statements.json deployment.json; aws lambda update-function-code --function-name 'kannatanfi-prod' --zip-file fileb://function.zip --profile $1 --region eu-west-1; rm function.zip
aws s3 cp --recursive static/ s3://static.kannatan.fi/ --profile $1

aws s3 sync ./static s3://static.kannatan.fi/ --delete --profile $1
aws cloudfront create-invalidation --distribution-id E1NJFZ6D28XY7J	 --paths "/*" --profile $1

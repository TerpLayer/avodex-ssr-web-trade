s3bucket=$1
deployEnv=$2
projectGroup=$3
projectName=$4

echo "upload static files to s3://${s3bucket}/${projectGroup}/${projectName}"
aws s3 sync ./.next/static s3://${s3bucket}/${projectGroup}/${projectName}/_next/static
aws s3 sync ./public s3://${s3bucket}/${projectGroup}/${projectName}/public

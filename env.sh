deployEnv=$1
buildTime=$(date +%Y-%m-%dT%H:%M:%S)

if [ "$deployEnv"x = "dev"x ]; then
  cp -f ./.env.development ./.env.production
elif [ "$deployEnv"x = "test"x ]; then
  cp -f ./.env.test ./.env.production
elif [ "$deployEnv"x = "uat"x ]; then
  cp -f ./.env.uat ./.env.production
else
  cp -f ./.env.production ./.env.production
fi

echo "\n\nBUILD_TIME=$buildTime" >> ./.env.production

echo "copy env : "$deployEnv

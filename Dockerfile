FROM registry.gitlab.com/cexdemo/base/web-ci:az as build

ARG s3Bucket
ARG deployEnv
ARG projectGroup
ARG projectName
ARG npmToken
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION=ap-northeast-1

ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
ENV deployEnv=${deployEnv:-production}
ENV s3Bucket=${s3Bucket}
ENV projectGroup=${projectGroup:-cexdemo}
ENV projectName=${projectName}
ENV NODE_OPTIONS="--max-old-space-size=8192"

#WORKDIR /app
WORKDIR /${projectGroup}/${projectName}
COPY . .
RUN rm -rf .npmrc
# 写入 NPM 登录信息到 .npmrc
RUN echo "//nexus.azwork.space/repository/npm-group/:_auth=${npmToken}" > ~/.npmrc && \
    echo "registry=https://nexus.azwork.space/repository/npm-group/" >> ~/.npmrc
RUN cat ~/.npmrc
RUN npm install --registry=https://nexus.azwork.space/repository/npm-group/
RUN npm run build_${deployEnv}

# push static
RUN sh s3.sh ${s3Bucket} ${deployEnv} ${projectGroup} ${projectName}


FROM node:16.19.1-slim

ARG deployEnv
ARG projectGroup
ARG projectName
ENV deployEnv=${deployEnv:-production}
ENV projectGroup=${projectGroup}
ENV projectName=${projectName}
WORKDIR /${projectGroup}/${projectName}

COPY --from=build /${projectGroup}/${projectName}/.next/standalone ./

ENV PORT 8081
EXPOSE 8081/tcp

# 设置时区环境变量
ENV TZ=UTC

CMD npm run start

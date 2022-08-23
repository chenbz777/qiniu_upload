FROM node:14.18.2-alpine3.12

LABEL maintainer="chenbz"

RUN mkdir -p /usr/local/app && \
    cd /usr/local/app

WORKDIR /usr/local/app

COPY . /usr/local/app

RUN npm install -g cnpm --registry=https://registry.npmmirror.com

RUN cnpm i --production

EXPOSE 7001

ENV ACCESSKEY ''

ENV SECRETKEY ''

ENV BUCKET ''

ENV ZONE ''

ENV IMGHOST ''

CMD npm start
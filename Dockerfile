ARG NODE_VERSION=22.0.0
ARG NGINX_VERSION=1.27.1
ARG PCRE_VERSION=10.42
ARG ZLIB_VERSION=1.3.1
ARG LIBRESSL_VERSION=3.9.1

ARG S6_OVERLAY_VERSION=3.1.4.1

#ARG RTMP_VERSION=1.2.2

ARG WEBUI_DIR=/webui

FROM node:${NODE_VERSION}-alpine AS node

FROM alpine:latest AS build
RUN \
    echo "Update and install dependencies" && \
    apk update && \
    apk add --no-cache \
        git \
        make \
        cmake \
        wget \
        build-base \
        go \
        perl \
        linux-headers && \
    echo "Create build and source directories" && \
    mkdir -p /build /source

FROM build AS download-libressl
ARG LIBRESSL_VERSION
WORKDIR /source
RUN wget https://ftp.openbsd.org/pub/OpenBSD/LibreSSL/libressl-$LIBRESSL_VERSION.tar.gz
RUN tar -zxf libressl-$LIBRESSL_VERSION.tar.gz -C .
RUN rm -f libressl-$LIBRESSL_VERSION.tar.gz
RUN mv libressl-$LIBRESSL_VERSION/ ./libressl

FROM build AS download-pcre2
ARG PCRE_VERSION
WORKDIR /source
RUN wget github.com/PCRE2Project/pcre2/releases/download/pcre2-$PCRE_VERSION/pcre2-$PCRE_VERSION.tar.gz
RUN tar -zxf pcre2-$PCRE_VERSION.tar.gz -C .
RUN rm -f pcre2-$PCRE_VERSION.tar.gz
RUN mv pcre2-$PCRE_VERSION/ ./pcre2

FROM build AS download-zlib
ARG ZLIB_VERSION
WORKDIR /source
RUN wget https://zlib.net/zlib-$ZLIB_VERSION.tar.gz
RUN tar -zxf zlib-$ZLIB_VERSION.tar.gz -C .
RUN rm -f zlib-$ZLIB_VERSION.tar.gz
RUN mv zlib-$ZLIB_VERSION/ ./zlib

FROM build AS build-nginx
ARG NGINX_VERSION
WORKDIR /source

RUN wget https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz
RUN tar zxf nginx-$NGINX_VERSION.tar.gz
RUN rm -f nginx-$NGINX_VERSION.tar.gz

COPY --from=download-pcre2 /source/pcre2 /source/pcre2
COPY --from=download-zlib /source/zlib /source/zlib
COPY --from=download-libressl /source/libressl /source/libressl

WORKDIR /source/nginx-$NGINX_VERSION
RUN ./configure \
        --prefix=/usr/local/nginx \
        --conf-path=/etc/nginx/nginx.conf \
        --with-pcre=/source/pcre2 \
        --with-pcre-jit \
        --with-zlib=/source/zlib \
        --with-openssl=/source/libressl \
        --with-http_ssl_module \
        --with-http_v2_module \
        --with-http_auth_request_module \
        --with-stream \
        --with-stream_ssl_module \
        --with-threads \
        --with-debug \
        --with-http_v3_module \
        --with-cc-opt="-I../libressl/build/include" \
        --with-ld-opt="-L../libressl/build/lib"
RUN make
RUN make install

# Download and extract s6-overlay

FROM alpine:latest AS build-webui

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

RUN apk add \
    openssl \
    npm

COPY / /webui/
WORKDIR /webui/
# Local build will end up copying node_modules
RUN rm -rf node_modules
RUN npm i -g pnpm
RUN pnpm i
RUN pnpm prisma:generate
RUN pnpm build
RUN pnpm i -P
#ENTRYPOINT [ "tail", "-f", "/dev/null" ]

FROM alpine:latest AS s6-base
ARG S6_OVERLAY_VERSION


ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz /tmp
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz /tmp
RUN tar xvf /tmp/s6-overlay-noarch.tar.xz -C /
RUN tar xvf /tmp/s6-overlay-x86_64.tar.xz -C /
RUN apk add \
    openssl \
    nodejs \
    npm

# Start the final image

FROM s6-base AS nginx

COPY --from=build-nginx /usr/local/nginx /usr/local/nginx
COPY --from=build-nginx /etc/nginx /etc/nginx

WORKDIR /
COPY root/ /

RUN \
    find /etc/s6-overlay/s6-rc.d/ -name "run" -exec chmod +x {} \; && \
    find /etc/s6-overlay/s6-rc.d/ -name "up" -exec chmod +x {} \;

ENTRYPOINT [ "/init" ]
#ENTRYPOINT [ "tail", "-f", "/dev/null" ]

# UDP is required for http3/QUIC.
EXPOSE 80/tcp 443/tcp 80/udp 443/udp

VOLUME [ "/config", "/ssl", "/log" ]
ENV PORT=8080

FROM nginx AS webui
ARG WEBUI_DIR
RUN mkdir -p ${WEBUI_DIR}
WORKDIR ${WEBUI_DIR}
COPY --from=build-webui /webui/build/ ./
COPY --from=build-webui /webui/package.json ./package.json
COPY --from=build-webui /webui/prisma ./prisma
COPY --from=build-webui /webui/node_modules ./node_modules
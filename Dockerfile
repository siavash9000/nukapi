FROM bitnami/nginx:1.16.1

WORKDIR /website
ADD . /website

ENV HUGO_VERSION 0.69.0
ENV HUGO_BINARY hugo_extended_${HUGO_VERSION}_linux-64bit

USER 0
ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY}.tar.gz .
RUN tar xzf ./${HUGO_BINARY}.tar.gz

RUN ./hugo
COPY oc_conf/nginx.conf /opt/bitnami/nginx/conf/nginx.conf:ro
USER 1001


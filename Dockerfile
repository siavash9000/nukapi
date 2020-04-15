FROM nukapi/nginx-hugo:latest
WORKDIR /website
ADD . /website
USER 0
RUN /hugo/hugo
COPY oc_conf/nginx.conf /opt/bitnami/nginx/conf/nginx.conf
RUN chown -R 1001:1001 /website/public
RUN chown -R 1001:1001 /opt/bitnami/nginx
USER 1001


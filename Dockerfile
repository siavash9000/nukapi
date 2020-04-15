FROM nukapi/nginx-hugo:latest
WORKDIR /website
ADD . /website
USER 0
RUN /hugo/hugo
COPY oc_conf/nginx.conf /opt/bitnami/nginx/conf/nginx.conf
RUN chgrp -R 0 /opt/bitnami/nginx/ && chmod -R g=u /opt/bitnami/nginx/
USER 1001


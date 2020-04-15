FROM nukapi/nginx-hugo:latest
WORKDIR /website
ADD . /website
USER 0
RUN /hugo/hugo
COPY oc_conf/nginx.conf /opt/bitnami/nginx/conf/nginx.conf
RUN chgrp -R 0 /opt/bitnami/ && chmod -R g=u /opt/bitnami/


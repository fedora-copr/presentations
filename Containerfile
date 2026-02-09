FROM registry.fedoraproject.org/fedora:latest

RUN dnf install -y nodejs npm git && dnf clean all

RUN git clone --depth 1 https://github.com/hakimel/reveal.js.git /revealjs \
    && cd /revealjs && npm ci

RUN mkdir -p /presentation

COPY server.js /server.js

EXPOSE 8000

CMD ["node", "/server.js"]

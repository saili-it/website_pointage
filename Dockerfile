# Site vitrine Pointage — statique, servi par nginx sur le port 9090.
# Pas d'étape de build : il n'y a ni bundler ni dépendance à installer.

FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="pointage-site" \
      org.opencontainers.image.description="Site vitrine Pointage (pointage.marchepro.ma)" \
      org.opencontainers.image.source="https://pointage.marchepro.ma/"

COPY nginx.conf /etc/nginx/conf.d/default.conf

# On copie explicitement ce qui doit être servi, et rien d'autre : les
# fichiers sources restés à la racine du dépôt (l'enregistrement d'écran
# original de 92 Mo, le PNG de la maquette) n'ont rien à faire dans l'image.
COPY index.html pointeuses.html robots.txt sitemap.xml /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 9090

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:9090/healthz >/dev/null 2>&1 || exit 1

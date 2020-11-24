#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive

printf "\033[1;33mletsencrypt\033[0m setup.\n\n"

############################################################

if test -f "/.secrets/digitalocean.ini"; then

  printf "\033[1;33mcertbot\033[0m install"

  # actually install certbot
  apt-get -y install \
  python \
  python3-certbot-dns-digitalocean \
  certbot \
  >> /var/log/grundstein/install.log 2>&1

  printf " - \033[0;32mdone\033[0m\n\n"


  ############################################################


  printf "\033[1;33mcertbot\033[0m - generate certificates\n"

  certbot certonly \
    -n \
    --dns-digitalocean \
    --dns-digitalocean-credentials /.secrets/digitalocean.ini \
    --dns-digitalocean-propagation-seconds 10 \
    --agree-tos \
    --cert-name wiznwit.com \
    --email grundstein@jaeh.at \
    -d *.wiznwit.com,wiznwit.com
    # -d *.thesystem.at,thesystem.at

  printf "certificate generation - \033[0;32mdone\033[0m\n\n"

  ############################################################


  printf "\033[1;33mchown\033[0m certificates"

  chown grundstein:root -R /etc/letsencrypt/archive /etc/letsencrypt/live

  printf " - \033[0;32mdone\033[0m\n\n"
fi

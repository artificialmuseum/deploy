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


  ############################################################


  printf "\033[1;33mcertbot\033[0m - create cronjob bin file"

  REFRESH_FILE=/home/grundstein/refresh-certificates

  rm -f $REFRESH_FILE
  touch $REFRESH_FILE

  printf '#!/usr/bin/env bash\n\n' >> $REFRESH_FILE
  printf 'certbot renew\n\n' >> $REFRESH_FILE
  printf 'service gss restart\n\n' >> $REFRESH_FILE

  chmod +x $REFRESH_FILE

  printf " - \033[0;32mdone\033[0m\n\n"
  

  ############################################################


  CRON_FILE="/home/grundstein/cronjobs"

  if [ ! -f $CRON_FILE ]; then
    printf "\033[1;33mcreate $CRON_FILE\033[0m"
 
    touch $CRON_FILE
  
    printf " - \033[0;32mdone\033[0m\n\n"
  fi
  

  ############################################################


  printf "\033[1;33mwrite cronjobs to tmp file\033[0m"
 
  crontab -l > $CRON_FILE
  
  printf " - \033[0;32mdone\033[0m\n\n"


  ############################################################

  CRON_JOB="0 0 * * * $REFRESH_FILE"
  
  printf "\033[1;33mpush cronjob to cronfile \033[0m\n"

  grep -qF -- "$CRON_JOB" "$CRON_FILE" || echo "$CRON_JOB" >> "$CRON_FILE"

  # install new cron file
  crontab $CRON_FILE

  # remove tmp cron file
  rm $CRON_FILE

  printf "\033[0;32mdone adding cronjob\033[0m\n\n"

fi

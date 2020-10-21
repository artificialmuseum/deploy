#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - create letsencrypt certificates.\n"

############################################################

if test -f "/.secrets/digitalocean.ini"; then
  # actually install certbot
  apt-get -y install \
  python \
  python3-certbot-dns-digitalocean \
  certbot \
  >> /var/log/grundstein/install.log 2>&1

  printf " - \033[0;32mdone\033[0m\n\n"


  ############################################################


  printf "\033[1;33mcertbot\033[0m - generate certificates"

  certbot certonly \
    -n \
    --dns-digitalocean \
    --dns-digitalocean-credentials /.secrets/digitalocean.ini \
    --dns-digitalocean-propagation-seconds 10 \
    --agree-tos \
    --cert-name wiznwit.com \
    --email grundstein@jaeh.at \
    -d static2.wiznwit.com,glb2.wiznwit.com,maps2.wiznwit.com,wiznwit.com
    # -d *.thesystem.at,thesystem.at

  printf " - \033[0;32mdone\033[0m\n\n"

  chown grundstein:root -R /etc/letsencrypt/archive /etc/letsencrypt/live


  ############################################################


  printf "\033[1;33mcertbot\033[0m - add cronjob"

  touch /home/grundstein/refresh-certificates

  echo "certbot renew && service gss restart" >> /home/grundstein/refresh-certificates

  CRON_FILE="/var/spool/cron/root"  
  CRON_JOB="@daily /usr/bin/env bash /home/grundstein/refresh-certificates"

  if [ ! -f $CRON_FILE ]; then
    printf "\033[1;33mcreate $CRON_FILE\033[0m"
 
    touch $CRON_FILE
    /usr/bin/crontab $CRON_FILE
  
    printf "\033[0;32mdone\033[0m\n\n"
  fi

  grep -qxF $CRON_JOB $CRON_FILE
  if [ $? != 0 ]; then
    printf "\033[1;33mcreate $CRON_FILE\033[0m"

    /bin/echo $CRON_JOB >> $CRON_FILE

    printf "\033[0;32mdone\033[0m\n\n"
  fi

  printf "\033[0;32mdone adding cronjob\033[0m\n\n"

fi

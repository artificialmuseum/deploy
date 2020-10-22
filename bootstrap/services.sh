#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive

printf "\033[1;33mgrundstein\033[0m service setup.\n\n"


############################################################


printf "\033[1;33mcreate services directory\033[0m"

mkdir -p /home/grundstein/services

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

GIT_USER=grundstein

SERVICE_ARRAY=(
  "gps"
  "grs"
  "gss"
)

for SERVICE_NAME in "${SERVICE_ARRAY[@]}" ;
do
  printf "\033[1;33m@$GIT_USER/$SERVICE_NAME\033[0m install"

  if [ ! -d "/home/grundstein/services/$SERVICE_NAME" ] ; then
    git clone --depth 1 git://github.com/$GIT_USER/$SERVICE_NAME /home/grundstein/services/$SERVICE_NAME >> /var/log/grundstein/install.log 2>&1
  else
    cd "/home/grundstein/services/$SERVICE_NAME"
    git pull origin master >> /var/log/grundstein/install.log 2>&1
  fi

  cd /home/grundstein/services/$SERVICE_NAME

  npm install --production >> /var/log/grundstein/install.log 2>&1

  npm link >> /var/log/grundstein/install.log 2>&1

  cd /

  printf " - \033[0;32mdone\033[0m\n\n"


  ############################################################


  printf "\033[1;33m@$GIT_USER/$SERVICE_NAME\033[0m setup"

  cp /grundsteinlegung/src/systemd/$SERVICE_NAME.service /etc/systemd/system/

  systemctl enable $SERVICE_NAME

  systemctl restart $SERVICE_NAME

  printf " - \033[0;32mdone\033[0m\n\n"
done

printf "\033[1;33mservices.sh\033[0m - \033[0;32mdone\033[0m\n\n"
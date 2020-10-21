#!/usr/bin/env bash

set -euf -o pipefail

printf "\033[1;33mgrundstein\033[0m static page setup.\n\n"

############################################################


printf "\033[1;33mcreate repositories directory\033[0m"

mkdir -p /home/grundstein/repositories

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mcloning page:\033[0m static.thesystem.at"

PAGE_HOST='$PAGE_HOST'
DIR="/home/grundstein/repositories/$PAGE_HOST"

if [ ! -d "$DIR" ] ; then
  git clone git://github.com/thesystemcollective/static.thesystem.at $DIR >> /var/log/grundstein/install.log 2>&1
else
  cd "$DIR"
  git pull origin master >> /var/log/grundstein/install.log 2>&1
fi

cd "$DIR"

# force update dependencies
rm -rf node_modules package-lock.json

# install dependencies
npm install >> /var/log/grundstein/install.log 2>&1

# copy docs directory, if it exists
if [ -d "$DIR/docs" ]; then
  mkdir -p /var/www/html/
  cp -r ./docs /var/www/html/$PAGE_HOST
fi

printf " - \033[0;32mdone\033[0m.\n\n"


############################################################


printf "\033[1;33madding host to proxy list\033[0m"

PROXY_FILE=/home/grundstein/proxies

if [ ! -f "$DIR/docs" ]; then
  touch $PROXY_FILE
fi

grep -qxF "$PAGE_HOST" $PROXY_FILE || echo "$PAGE_HOST" >> $PROXY_FILE

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

printf "\033[1;33mpages.sh\033[0m - \033[0;32mdone\033[0m\n\n"

############################################################

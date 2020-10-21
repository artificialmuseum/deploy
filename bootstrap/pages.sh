#!/usr/bin/env bash

set -euf -o pipefail

printf "\033[1;33mgrundstein\033[0m static page setup.\n"

############################################################


printf "\033[1;33mtouch\033[0m /grundstein.lock"

if test -f "/grundstein.lock"; then
  printf "/grundstein.lock exists.\n"
  printf "there is an installation running or a past installation failed.\n"
  printf "to force reinstallation, add the --force flag to the grundstein command.\n"
  exit 1
fi

touch /grundstein.lock

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mcreate repositories directory\033[0m"

mkdir -p /home/grundstein/repositories

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mcloning page:\033[0m static.thesystem.at"

DIR="/home/grundstein/repositories/static2.thesystem.at"

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
  cp -r ./docs /var/www/html/static2.thesystem.at
fi

printf " - \033[0;32mdone\033[0m.\n\n"


############################################################


printf "\033[1;33madding host to proxy list\033[0m"

PROXY_FILE=/home/grundstein/proxies

if [ ! -f "$DIR/docs" ]; then
  touch $PROXY_FILE
fi

HAS_PROXY=grep -qxF 'static2.thesystem.at' $PROXY_FILE
if [ $? != 0 ]; then
  echo 'static2.thesystem.at' >> $PROXY_FILE
fi

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mremoving /grundstein.lock\033[0m"

rm -f /grundstein.lock

printf " - \033[0;32mdone\033[0m\n\n"

echo "\033[1;33mGRUNDSTEIN\033[0m - static page install finished." >> /var/log/grundstein/install.log

printf "STATIC PAGE INSTALL FINISHED.\n"

############################################################

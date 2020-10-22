#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive

printf "\033[1;33mgrundstein\033[0m static page setup.\n\n"

############################################################


printf "\033[1;33mcreate repositories directory\033[0m"

mkdir -p /home/grundstein/repositories

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

GIT_USER=thesystemcollective

PAGE_STATIC=("static.wiznwit.com" "$GIT_USER/static.thesystem.at")
PAGE_GLB=("glb.wiznwit.com" "$GIT_USER/glb.thesystem.at")
PAGE_MAP=("map.wiznwit.com" "$GIT_USER/map.thesystem.at")
PAGE_ROOT=("wiznwit.com" "$GIT_USER/demo.thesystem.at")

PAGE_ARRAY=(
  PAGE_STATIC[@]
  PAGE_GLB[@]
  PAGE_MAP[@]
  PAGE_ROOT[@]
)

COUNT=${#PAGE_ARRAY[@]}
for ((i=0; i<$COUNT; i++))
do
  PAGE_HOST=${!PAGE_ARRAY[i]:0:1}
  PAGE_REPOSITORY=${!PAGE_ARRAY[i]:1:1}

  printf "\033[1;33mcloning:\033[0m $PAGE_REPOSITORY"

  DIR="/home/grundstein/repositories/$PAGE_HOST"

  if [ ! -d "$DIR" ] ; then
    git clone --depth 1 git://github.com/$PAGE_REPOSITORY $DIR >> /var/log/grundstein/install.log 2>&1
  else
    cd "$DIR"
    git pull origin master >> /var/log/grundstein/install.log 2>&1
  fi

  printf " - \033[0;32mdone\033[0m.\n\n"


  ############################################################


  printf "\033[1;33mnpm install\033[0m"

  cd "$DIR"

  npm install --production >> /var/log/grundstein/install.log 2>&1

  printf " - \033[0;32mdone\033[0m.\n\n"

  
  ############################################################


  printf "\033[1;33mcopy $PAGE_HOST\033[0m to /var/www/html"

  if [ -d "$DIR/docs" ]; then
    mkdir -p /var/www/html/
    cp -r $DIR/docs /var/www/html/$PAGE_HOST
  fi

  printf " - \033[0;32mdone\033[0m.\n\n"

done


############################################################


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

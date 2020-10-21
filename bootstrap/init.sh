#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive

printf "Starting grundstein install"

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


printf "\033[1;33mlog dir\033[0m - mkdir -p /var/log/grundstein/"

mkdir -p /var/log/grundstein/

printf " - \033[0;32mcreated\033[0m\n\n"


############################################################


printf "\033[1;33mapt update\033[0m"

apt-get -y update >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mlanguage\033[0m - setup"

sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen

locale-gen >> /var/log/grundstein/install.log 2>&1

export LANG='en_US.UTF-8'
export LANGUAGE='en_US:en'
export LC_ALL='en_US.UTF-8'

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mtimezones\033[0m - setup"

apt-get install -y tzdata ntp >> /var/log/grundstein/install.log 2>&1

ln -fs /usr/share/zoneinfo/Europe/Vienna /etc/localtime

dpkg-reconfigure -f noninteractive tzdata >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mapt upgrade\033[0m"

apt-get -qq -y upgrade >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33minstall\033[0m dependencies"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.

apt-get -qq -y install \
git \
makepasswd \
curl \
software-properties-common \
nano \
# >> /var/log/grundstein/install\.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mapt autoremove\033[0m"

apt-get -y autoremove >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"



############################################################


printf "\033[1;33minstall\033[0m dependencies"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.

apt-get -qq -y install git makepasswd curl software-properties-common nano >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "grundstein" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "/home/grundstein" -s /bin/bash "grundstein"
)

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mgit clone\033[0m grundsteinlegung"

if [ ! -d "/grundsteinlegung" ] ; then
  git clone "git://github.com/grundstein/cli" /grundsteinlegung >> /var/log/grundstein/install.log 2>&1
else
  cd /grundsteinlegung
  git pull origin master >> /var/log/grundstein/install.log 2>&1
  cd /
fi

printf " - \033[0;32mcloned\033[0m\n\n"


############################################################



printf "\033[1;33mnodejs\033[0m"

command -v node >/dev/null 2>&1 && export NODE_VERSION=$(node --version) || export NODE_VERSION="0"

if (test "$NODE_VERSION" != "v13.*") then
  printf " - install - "

  /usr/bin/env bash /grundsteinlegung/bash/node.sh >> /var/log/grundstein/install.log 2>&1

  printf " - \033[0;32mdone\033[0m\n\n"
else
  printf " ${NODE_VERSION} - already \033[0;32minstalled\033[0m\n\n"
fi


############################################################


printf "remove /grundstein/lock"

rm /grundstein.lock

printf " - \033[0;32mdone\033[0m\n\n"
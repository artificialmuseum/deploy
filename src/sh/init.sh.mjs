import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  const { redirectLog } = args

  return `
printf "${YELLOW}grundstein${NC} init.\\n\\n"


############################################################


printf "${YELLOW}log dir${NC} - mkdir -p /var/log/grundstein/"

mkdir -p /var/log/grundstein/

printf " - ${GREEN}created${NC}\\n\\n"


############################################################


printf "${YELLOW}apt update${NC}"

apt-get -y update ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}language${NC} - setup"

sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen

locale-gen ${redirectLog}

export LANG='en_US.UTF-8'
export LANGUAGE='en_US:en'
export LC_ALL='en_US.UTF-8'

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}timezones${NC} - setup"

apt-get install -y tzdata ntp ${redirectLog}

ln -fs /usr/share/zoneinfo/Europe/Vienna /etc/localtime

dpkg-reconfigure -f noninteractive tzdata ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}apt upgrade${NC}"

apt-get -qq -y upgrade ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}install${NC} dependencies"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.

apt-get -qq -y install \
git \
makepasswd \
curl \
software-properties-common \
nano

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}apt autoremove${NC}"

apt-get -y autoremove ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"



############################################################


printf "${YELLOW}apt install${NC}"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.

apt-get -qq -y install \
git \
makepasswd \
curl \
software-properties-common \
nano \
${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}add user${NC}"

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "grundstein" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "/home/grundstein" -s /bin/bash "grundstein"
)

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}git clone${NC} grundsteinlegung"

if [ ! -d "/grundsteinlegung" ] ; then
  git clone "git://github.com/grundstein/cli" /grundsteinlegung ${redirectLog}
else
  cd /grundsteinlegung
  git pull origin master ${redirectLog}
  cd /
fi

printf " - ${GREEN}cloned${NC}\\n\\n"


############################################################



printf "${YELLOW}nodejs${NC}"

command -v node >/dev/null 2>&1 && export NODE_VERSION=$(node --version) || export NODE_VERSION="0"

if (test "$NODE_VERSION" != "v13.*") then
  printf " - install"

  /usr/bin/env bash /grundsteinlegung/bash/node.sh ${redirectLog}

  printf " - ${GREEN}done${NC}\\n\\n"
else
  printf " $NODE_VERSION - already ${GREEN}installed${NC}\\n\\n"
fi


############################################################

printf "${YELLOW}init.sh${NC} - ${GREEN}done${NC}\\n\\n"
`
}
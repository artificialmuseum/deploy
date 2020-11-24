import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  const { redirectLog } = args

  const services = [
    "gps",
    "grs",
    "gss",
  ]

  const initServices = services.map(name => {
    return `
printf "${YELLOW}@grundstein/${name}${NC} install"

if [ ! -d "/home/grundstein/services/${name}" ] ; then
  git clone --depth 1 git://github.com/grundstein/${name} /home/grundstein/services/${name} ${args.redirectLog}
else
  cd "/home/grundstein/services/${name}"
  git pull origin master ${args.redirectLog}
fi

cd /home/grundstein/services/${name}

npm install --production ${args.redirectLog}

npm link ${args.redirectLog}

cd /

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}@grundstein/${name}${NC} setup"

cp /grundsteinlegung/src/systemd/${name}.service /etc/systemd/system/

systemctl enable ${name}

systemctl restart ${name}

printf " - ${GREEN}done${NC}\\n\\n"
`.trim()
  })

  return `
printf "${YELLOW}grundstein${NC} service setup.\\n\\n"

############################################################


printf "${YELLOW}create services directory${NC}"

mkdir -p /home/grundstein/services

printf " - ${GREEN}done${NC}\\n\\n"


############################################################

${initServices.join(`

############################################################

`)}

printf "${YELLOW}services.sh${NC} - ${GREEN}done${NC}\\n\\n"
  `
}
import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  console.log({ args })

  const proxyFile = '/home/grundstein/proxies'

  args.pages = [
    [`static.${args.url}`, `${args.gitUser}/static.thesystem.at`],
    [`glb.${args.url}`, `${args.gitUser}/glb.thesystem.at`],
    [`map.${args.url}`, `${args.gitUser}/map.thesystem.at`],
    [args.url, `${args.gitUser}/thesystem.at`],
  ]

  const initPages = args.pages.map(page => {

    const [pageHost, pageRepository] = page

    return `
  printf "${YELLOW}cloning:${NC} ${pageRepository}"

  DIR="/home/grundstein/repositories/${pageHost}"

  if [ ! -d "$DIR" ] ; then
    git clone --depth 1 git://github.com/${pageRepository} $DIR ${args.redirectLog}
  else
    cd "$DIR"
    git pull origin master ${args.redirectLog}
  fi

  printf " - ${GREEN}done${NC}.\n\n"

  
  ############################################################


  printf "${YELLOW}symlink ${pageHost}${NC} to /var/www/html"

  if [ -d "$DIR/docs" ]; then
    mkdir -p /var/www/html/
    ln -sf $DIR/docs /var/www/html/${pageHost}
  fi

  printf " - ${GREEN}done${NC}.\n\n"


  ############################################################


  printf "${YELLOW}adding ${pageHost} to proxy list${NC}"

  if [ ! -f "${proxyFile}" ]; then
    touch ${proxyFile}
  fi

  grep -qxF ${pageHost} ${proxyFile} || echo "${pageHost}" >> ${proxyFile}

  grep -qxF ${pageHost} ${proxyFile} || printf "add ${pageHost} to ${proxyFile}"

  printf " - ${GREEN}done${NC}\n\n"
`.trim()
  })

  return `
printf "${YELLOW}grundstein${NC} static page setup.\n\n"

############################################################


printf "${YELLOW}create repositories directory${NC}"

mkdir -p /home/grundstein/repositories

printf " - ${GREEN}done${NC}\n\n"


############################################################

GIT_USER=thesystemcollective

${initPages.join('\n')}


############################################################

printf "${YELLOW}pages.sh${NC} - ${GREEN}done${NC}\n\n"

############################################################
`
}
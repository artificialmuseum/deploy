import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  const { redirectLog } = args

  return `
printf "${YELLOW}letsencrypt${NC} setup.\\n\\n"

############################################################

if test -f "/.secrets/digitalocean.ini"; then

  printf "${YELLOW}certbot${NC} install"

  # actually install certbot
  apt-get -y install \
  python \
  python3-certbot-dns-digitalocean \
  certbot \
  ${redirectLog}

  printf " - ${GREEN}done${NC}\\n\\n"


  ############################################################


  printf "${YELLOW}certbot${NC} - generate certificates\n"

  certbot certonly \
    -n \
    --dns-digitalocean \
    --dns-digitalocean-credentials /.secrets/digitalocean.ini \
    --dns-digitalocean-propagation-seconds 10 \
    --agree-tos \
    --cert-name "${args.url}" \
    --email grundstein@jaeh.at \
    -d "*.${args.url},${args.url}"

  printf "certificate generation - ${GREEN}done${NC}\\n\\n"

  ############################################################


  printf "${YELLOW}chown${NC} certificates"

  chown grundstein:root -R /etc/letsencrypt/archive /etc/letsencrypt/live

  printf " - ${GREEN}done${NC}\\n\\n"
fi
`
}

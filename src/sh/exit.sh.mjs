import { colors } from '../lib/index.mjs'

export default async args => {
  const { YELLOW, GREEN, NC } = colors
  const { SSH_USER_NAME } = process.env

  if (!SSH_USER_NAME) {
    log.error('No SSH_USER_NAME process.env variable found')
    process.exit(1)
  }

  return `
printf "${YELLOW}GRUNDSTEIN${NC} - removing secret file"

ssh -t ${SSH_USER_NAME}@${args.ip} 'sudo rm -f /.secrets/digitalocean.ini'

printf " - ${GREEN}done${NC}\\n\\n"
`
}

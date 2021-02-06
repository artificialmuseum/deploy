import { colors } from '../lib/index.mjs'

export default async args => {
  const { SSH_USER_NAME } = process.env

  if (!SSH_USER_NAME) {
    log.error('No SSH_USER_NAME process.env variable found')
    process.exit(1)
  }

  return `
ssh -t ${SSH_USER_NAME}@${args.ip} sudo rm -f /.secrets/digitalocean.ini
`
}

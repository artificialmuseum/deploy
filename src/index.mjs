import path from 'path'

import cli from '@magic/cli'

import { fs, log } from '@grundstein/commons'

import sh from './sh/index.mjs'

import { colors } from './lib/index.mjs'

export const run = async ({ args, commands }) => {
  const cwd = process.cwd()

  await fs.mkdirp(path.join(cwd, 'bootstrap'))

  const { YELLOW, NC } = colors

  const prefix = `
#!/usr/bin/env bash

set -euf -o pipefail
  
export DEBIAN_FRONTEND=noninteractive

sudo su

###############################
`.trim()

  const init = await sh.init(args)
  const env = await sh.env(args)
  const certificates = await sh.certificates(args)
  // const certificateCronjob = await sh.certificateCronjob(args)
  const pages = await sh.pages(args)
  const services = await sh.services(args)
  const iptables = await sh.iptables(args)

  const result = [
    prefix,
    commands.init && init,
    commands.init && env,
    commands.certificates && certificates,
    // certificateCronjob,
    commands.pages && pages,
    commands.services && services,
    commands.iptables && iptables,
  ].filter(a => a).join('')

  //   const exec = `
  // ssh ${SSH_USER_NAME}@${args.ip} bash -s < bootstrap/init.sh
  // `.trim()

  const outputFile = path.join(cwd, 'bootstrap', 'remote.sh')

  await fs.writeFile(outputFile, result)

  const { SSH_USER_NAME } = process.env

  if (!SSH_USER_NAME) {
    log.error('No SSH_USER_NAME process.env variable found')
    process.exit(1)
  }

  const deploy = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}GRUNDSTEIN${NC} - pushing to production.\n\n"

if test -f ".secrets/digitalocean.ini"; then
  ssh ${SSH_USER_NAME}@${args.ip} 'mkdir -p /.secrets'
  scp .secrets/digitalocean.ini ${SSH_USER_NAME}@${args.ip}:/home/${SSH_USER_NAME}/digitalocean.ini
  ssh -t ${SSH_USER_NAME}@${args.ip} 'sudo mv /home/${SSH_USER_NAME}/digitalocean.ini /.secrets/digitalocean.ini'
  ssh ${SSH_USER_NAME}@${args.ip} 'chmod 600 /.secrets/digitalocean.ini'
fi

ssh ${SSH_USER_NAME}@${args.ip} bash -s < bootstrap/remote.sh

`.trim()

  await fs.writeFile(path.join(cwd, 'bootstrap', 'deploy.sh'), deploy)

  await cli.spawn('/usr/bin/env', ['bash', 'bootstrap/deploy.sh'])
}

export default run

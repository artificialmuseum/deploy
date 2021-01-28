import path from 'path'

import cli from '@magic/cli'

import { fs } from '@grundstein/commons'

import sh from './sh/index.mjs'

import { colors } from './lib/index.mjs'

export const run = async args => {
  const cwd = process.cwd()

  await fs.mkdirp(path.join(cwd, 'bootstrap'))

  const { YELLOW, NC } = colors

  const prefix = `
#!/usr/bin/env bash

set -euf -o pipefail
  
export DEBIAN_FRONTEND=noninteractive

###############################3
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
    init,
    env,
    certificates,
    // certificateCronjob,
    pages,
    services,
    iptables,
  ].join('')

  //   const exec = `
  // ssh root@${args.ip} bash -s < bootstrap/init.sh
  // `.trim()

  const outputFile = path.join(cwd, 'bootstrap', 'remote.sh')

  await fs.writeFile(outputFile, result)

  const deploy = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}GRUNDSTEIN${NC} - pushing to production.\n\n"

if test -f ".secrets/digitalocean.ini"; then
  ssh root@${args.ip} 'mkdir -p /.secrets'
  scp .secrets/digitalocean.ini root@${args.ip}:/.secrets/digitalocean.ini
  ssh root@${args.ip} 'chmod 600 /.secrets/digitalocean.ini'
fi

ssh root@${args.ip} bash -s < bootstrap/remote.sh

`.trim()

  await fs.writeFile(path.join(cwd, 'bootstrap', 'deploy.sh'), deploy)

  await cli.spawn('/usr/bin/env', ['bash', 'bootstrap/deploy.sh'])
}

export default run

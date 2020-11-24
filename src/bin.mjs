#!/usr/bin/env node

import { cli, is, log } from '@grundstein/commons'

import run from './index.mjs'

const opts = {
  options: [
    ['--help', '-help', 'help', '--h', '-h'],
    ['--url', '-u'],
    ['--install-log', '--log'],
    ['--git-user', '--user'],
    ['--ip'],
  ],
  default: {
    '--url': 'thesystem.at',
    '--install-log': '/var/log/grundstein/install.log',
    '--git-user': 'thesystemcollective',
    '--ip': '157.245.23.135',
  },
  single: ['--url', '--install-log', '--git-user', '--ip'],
  help: {
    name: 'thesystem.at',
    header: 'sets up the thesystem.at servers.',
    options: {
      '--url': 'which root hostname to use',
      '--install-log': 'where on the server logs are kept',
      '--git-user': 'git username to clone from',
      '--ip': 'ip of the server to ssh to',
    },
    example: `
# run:
src/bin.mjs
`,
  },
}


const doIt = async () => {
  const { args } = cli(opts)

  log.warn('SERVER INSTALL', 'This will force (re?)installation on your production server!')

  log.info('configuration:', JSON.stringify(args, null, 2))
  log.info('all services should keep working and restart automatically. it is prod though!')

  const yesNo = await cli.prompt('Are you sure?', { yesNo: true })

  if (!yesNo) {
    log('Aborting.')
    process.exit(0)
  }

  args.redirectLog = `>> ${args.installLog} 2>&1`

  await run(args)
}

doIt()

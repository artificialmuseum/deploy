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
    '--url': 'artificialmuseum.com',
    '--install-log': '/var/log/grundstein/install.log',
    '--git-user': 'artificialmuseum',
    '--ip': '188.166.200.97',
  },
  single: ['--url', '--install-log', '--git-user', '--ip'],
  help: {
    name: 'artificialmuseum deploy script',
    header: 'sets up the artificialmuseum.com servers.',
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

  // hardcoded for now
  args.pages = [
    [`static.${args.url}`, `${args.gitUser}/static.artificialmuseum.com`],
    [`glb.${args.url}`, `${args.gitUser}/glb.artificialmuseum.com`],
    [`map.${args.url}`, `${args.gitUser}/map.artificialmuseum.com`],
    [`staging.${args.url}`, `${args.gitUser}/staging.artificialmuseum.com`],
    [args.url, `${args.gitUser}/artificialmuseum.com`],
  ]

  args.redirectLog = `>> ${args.installLog} 2>&1`

  args.GSS = {
    CORS_ORIGIN: `${args.url} staging.${args.url}`,
    DIR: '/var/www/html',
    HOST: '0.0.0.0',
    PORT: 2350,
    CERT_DIR: '/home/grundstein/ca',
    PROXY_FILE: '/home/grundstein/proxies',
    CORS_HEADERS: 'Origin, X-Requested-With, Content-Type, Accept',
  }

  await run(args)
}

doIt()

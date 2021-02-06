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
  commands: ['all', 'init', 'certificates', 'pages', 'services', 'iptables'],
  single: ['--url', '--install-log', '--git-user', '--ip'],
  help: {
    name: 'artificialmuseum deploy script',
    header: 'sets up the artificialmuseum.com servers.',
    commands: {
      all: 'run all tasks (bootstrap the full server)',
      init: 'bootstrap server',
      certificates: 'refresh letsencrypt certificates',
      pages: 'git pull pages',
      services: 'restart services',
      iptables: 'rebuild firewall rules',
    },
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
  const res = cli(opts)

  const { args, commands } = res

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
    [`static.${args.url}`, `${args.gitUser}/static`],
    [`glb.${args.url}`, `${args.gitUser}/glb`],
    [`map.${args.url}`, `${args.gitUser}/map`],
    [`ios.${args.url}`, `${args.gitUser}/ios`],
    [`staging.${args.url}`, `${args.gitUser}/staging`],
    [args.url, `${args.gitUser}/${args.url}`],
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

  await run({ args, commands })
}

doIt()

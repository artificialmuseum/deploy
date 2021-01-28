import init from './init.sh.mjs'
import env from './env.sh.mjs'
import certificates from './certificates.sh.mjs'
import certificateCronjob from './certificates-cronjob.sh.mjs'
import pages from './pages.sh.mjs'
import services from './services.sh.mjs'
import iptables from './iptables.sh.mjs'

export default {
  init,
  env,
  certificates,
  certificateCronjob,
  pages,
  services,
  iptables,
}

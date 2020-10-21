#!/usr/bin/env bash

set -euf -o pipefail


printf "\033[1;33mGRUNDSTEIN\033[0m - pushing to production.\n\n"

DROPLET_IP=159.89.20.30

if test -f ".secrets/digitalocean.ini"; then
  ssh root@$DROPLET_IP 'mkdir -p /.secrets'
  scp .secrets/digitalocean.ini root@$DROPLET_IP:/.secrets/digitalocean.ini
  ssh root@$DROPLET_IP 'chmod 600 /.secrets/digitalocean.ini'
fi

ssh root@$DROPLET_IP bash -s < bootstrap/init.sh
ssh root@$DROPLET_IP bash -s < bootstrap/certificates.sh
ssh root@$DROPLET_IP bash -s < bootstrap/pages.sh
ssh root@$DROPLET_IP bash -s < bootstrap/services.sh
ssh root@$DROPLET_IP bash -s < bootstrap/iptables.sh
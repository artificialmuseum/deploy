
import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  return `
printf "${YELLOW}letsencrypt cronjob${NC} setup.\\n\\n"

############################################################

if test -f "/.secrets/digitalocean.ini"; then
  printf "${YELLOW}certbot${NC} - create cronjob bin file"

  REFRESH_FILE=/home/grundstein/refresh-certificates

  rm -f $REFRESH_FILE
  touch $REFRESH_FILE

  printf '#!/usr/bin/env bash\\n\\n' >> $REFRESH_FILE
  printf 'certbot renew\\n\\n' >> $REFRESH_FILE
  printf 'service gss restart\\n\\n' >> $REFRESH_FILE

  chmod +x $REFRESH_FILE

  printf " - ${GREEN}done${NC}\\n\\n"
  

  ###########################################################


  CRON_FILE="/home/grundstein/cronjobs"

  if [ ! -f $CRON_FILE ]; then
    printf "${YELLOW}create $CRON_FILE${NC}"
 
    touch $CRON_FILE
  
    printf " - ${GREEN}done${NC}\\n\\n"
  fi
  

  ###########################################################


  printf "${YELLOW}write cronjobs to tmp file${NC}"
 
  crontab -u grundstein -l > $CRON_FILE
  
  printf " - ${GREEN}done${NC}\\n\\n"


  ############################################################

  CRON_JOB="0 0 * * * $REFRESH_FILE"
  
  printf "${YELLOW}push cronjob to cronfile ${NC}\n"

  grep -qF -- "$CRON_JOB" "$CRON_FILE" || echo "$CRON_JOB" >> "$CRON_FILE"

  # install new cron file
  crontab -u grundstein $CRON_FILE

  # remove tmp cron file
  rm $CRON_FILE

  printf "${GREEN}done adding cronjob${NC}\\n\\n"
fi
`
}
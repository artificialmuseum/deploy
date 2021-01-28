import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  const envVars = JSON.stringify(
    Object.fromEntries(
      Object.entries(args.GSS).map(([k, v]) => {
        return [`GSS_${k}`, v]
      }),
    ),
  )

  return `
  printf "${YELLOW}grundstein${NC} setup environment persistence.\n\n"
  
  ############################################################
  
  printf "${YELLOW}delete /home/grundstein/environment${NC}"
  
  rm -f /home/grundstein/environment
 
  printf "${YELLOW}write /home/grundstein/environment${NC}"
  
  echo '${envVars}' >> /home/grundstein/environment
 

  printf " - ${GREEN}done${NC}\n\n"
  

  ############################################################
  
  `
}

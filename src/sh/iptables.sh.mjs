import { colors } from '../lib/index.mjs'

export default async args => {
  const { GREEN, RED, YELLOW, NC } = colors

  const { redirectLog } = args

  return `
printf "${YELLOW}iptables${NC} setup\\n\\n"


############################################################

printf "${YELLOW}install iptables-persistent${NC}"

apt-get -y install iptables-persistent ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"


############################################################

printf "${YELLOW}flush rules${NC}"

# flush rules
iptables -F
iptables -t nat -F

printf " - ${GREEN}done${NC}\\n\\n"


############################################################

printf "${YELLOW}internal rules${NC}"

# internal
iptables -I INPUT 1 -i lo -j ACCEPT

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}track connections${NC}"

# track connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}open ports${NC}"

# ports to open
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 4343 -j ACCEPT
iptables -A INPUT -p tcp --dport 2350 -j ACCEPT

printf " - ${GREEN}done${NC}\\n\\n"


############################################################


printf "${YELLOW}setup port redirects${NC}"

# port redirects

iptables -t nat -A PREROUTING -p tcp -m tcp --dport 443 -j REDIRECT --to-ports 4343
iptables -t nat -A PREROUTING -p tcp -m tcp --dport 80 -j REDIRECT --to-ports 8080

iptables -A INPUT -j DROP

printf " - ${GREEN}done${NC}\\n\\n"


############################################################

printf "${YELLOW}save iptables rules config${NC}"

# save
iptables-save > /etc/iptables/rules.v4

netfilter-persistent save ${redirectLog}
netfilter-persistent reload ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"

############################################################

printf "${YELLOW}iptables.sh${NC} - ${GREEN}done${NC}\\n\\n"
`
}
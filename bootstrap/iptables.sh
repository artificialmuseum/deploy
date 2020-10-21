#!/usr/bin/env bash

set -euf -o pipefail

printf "\033[1;33miptables\033[0m setup\n\n"


############################################################

printf "\033[1;33minstall iptables-persistent\033[0m"

apt-get -y install iptables-persistent >> /var/log/grundstein/install.log 2>&1


printf " - \033[0;32mdone\033[0m\n\n"


############################################################

printf "\033[1;33mflush rules\033[0m"

# flush rules
iptables -F
iptables -t nat -F

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

printf "\033[1;33minternal rules\033[0m"

# internal
iptables -I INPUT 1 -i lo -j ACCEPT

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33mtrack connections\033[0m"

# track connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33m open ports\033[0m"

# ports to open
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 4343 -j ACCEPT
iptables -A INPUT -p tcp --dport 2350 -j ACCEPT

printf " - \033[0;32mdone\033[0m\n\n"


############################################################


printf "\033[1;33msetup port redirects\033[0m"

# port redirects

iptables -t nat -A PREROUTING -p tcp -m tcp --dport 443 -j REDIRECT --to-ports 4343
iptables -t nat -A PREROUTING -p tcp -m tcp --dport 80 -j REDIRECT --to-ports 8080

iptables -A INPUT -j DROP

printf " - \033[0;32mdone\033[0m\n\n"


############################################################

printf "\033[1;33msave config\033[0m"

# save
iptables-save > /etc/iptables/rules.v4

netfilter-persistent save >> /var/log/grundstein/install.log 2>&1
netfilter-persistent reload >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"

############################################################

printf "\033[1;33miptables.sh\033[0m - \033[0;32mdone\033[0m\n\n"
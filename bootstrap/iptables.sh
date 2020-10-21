#!/usr/bin/env bash

set -euf -o pipefail

printf "\033[1;33mgrundstein\033[0m iptables setup.\n"


############################################################


printf "\033[1;33miptables\033[0m - setup"

apt-get -y install iptables-persistent >> /var/log/grundstein/install.log 2>&1

# flush rules
iptables -F
iptables -t nat -F

# internal
iptables -I INPUT 1 -i lo -j ACCEPT

# track connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# ports to open
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 4343 -j ACCEPT
iptables -A INPUT -p tcp --dport 2350 -j ACCEPT

# port redirects

iptables -t nat -A PREROUTING -p tcp -m tcp --dport 443 -j REDIRECT --to-ports 4343
iptables -t nat -A PREROUTING -p tcp -m tcp --dport 80 -j REDIRECT --to-ports 8080

iptables -A INPUT -j DROP

# save
iptables-save > /etc/iptables/rules.v4

netfilter-persistent save >> /var/log/grundstein/install.log 2>&1
netfilter-persistent reload >> /var/log/grundstein/install.log 2>&1

printf " - \033[0;32mdone\033[0m\n\n"

############################################################

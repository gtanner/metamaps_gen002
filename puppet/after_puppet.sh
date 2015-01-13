#!/bin/bash

su - vagrant -c /vagrant/puppet/after_puppet_as_vagrant.sh

#get desired config from passenger gem and put it in apache config
/home/vagrant/.rbenv/shims/passenger-install-apache2-module --snippet > /etc/apache2/mods-available/passenger.load
ln -s /etc/apache2/mods-available/passenger.load /etc/apache2/mods-enabled/passenger.load 2> /dev/null

#set up apache virtual host
cat << EOF > /etc/apache2/sites-available/default
<VirtualHost *:3000>
  DocumentRoot /vagrant/public
  <Directory /vagrant/public>
    Allow from all
    Options -MultiViews
  </Directory>
  ErrorLog /home/vagrant/error.log
  CustomLog /home/vagrant/access.log combined env=!justtesting
  RackEnv development
  RailsEnv development
</VirtualHost>
EOF

#change port to 3000
sed -i'' 's/Listen 80/Listen 3000/' /etc/apache2/ports.conf
sed -i'' 's/NameVirtualHost \*:80/NameVirtualHost *:3000/' /etc/apache2/ports.conf

service apache2 restart

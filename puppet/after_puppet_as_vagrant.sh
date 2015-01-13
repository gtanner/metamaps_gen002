#!bin/bash

cd /vagrant

#set up passenger apache module
gem install passenger -v 4.0.53
passenger-install-apache2-module --auto

bundle install

if [ ! -f /home/vagrant/.performed-rake.touch ]; then
  rake db:create
  rake db:schema:load
  rake db:fixtures:load
  touch /home/vagrant/.performed-rake.touch
fi

#create database.yml if it doesn't already exist
if [ ! -f /vagrant/config/database.yml ]; then
  cat << "EOF" > /vagrant/config/database.yml
development:
  min_messages: WARNING
  adapter: postgresql
  host: ""
  port: 5432
  encoding: unicode
  database: metamap002_development
  pool: 5
EOF
else
  echo "You already have a database.yml file at /vagrant/config/database.yml"
  echo "Consider copying it somewhere safe and replacing it with this:"
  echo ""
  cat << "EOF"
development:
  min_messages: WARNING
  adapter: postgresql
  host: ""
  port: 5432
  encoding: unicode
  database: metamap002_development
  pool: 5
EOF
fi

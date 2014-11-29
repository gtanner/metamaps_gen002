This file will help you create a develoment environment with a Vagrant virtual machine.

1) Install Ruby (this Ruby will make Vagrant work; we'll have other version(s) of Ruby specifically for Metamaps inside the vagrant virtual machine) (I think on Windows it doesn't need Ruby)
2) Install Vagrant from http://www.vagrantup.com/downloads.html
3) Install VirtualBox from https://www.virtualbox.org/wiki/Downloads. 

4) Clone the develop repository from github at https://github.com/Connoropolous/metamaps_gen002.git

5) Open a terminal or command prompt, and change directories to your repository.
6) Issue the command "vagrant up". Wait about 90 minutes for the machine to build and start up.
7) Visit http://localhost:3000 to see your new Metamaps instance.

The Vagrantfile and puppet configuration in the git repository will be used to create a virtual machine useful for development. From this directory, you can access the machine using Vagrant commands. Here are some of the commands:

vagrant ssh -> enter the virtual machine
vagrant up -> turn on the virtual machine
vagrant halt -> turn off the virtual machine
vagrant provision -> (while it is on: if you downloaded new configuration from github then this will rebuild the parts of the virtual machine that need to be changed)

===
Specific commands for Ubuntu Trusty 14.04.1
===

sudo apt-get install ruby ruby-dev virtualbox git

#do not use the Ubuntu repositories - download it directory
wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.6.5_i686.deb
dpkg -I vagrant_1.6.5_i686.deb
vagrant plugin install vagrant-vbguest #helps with virtualbox integration
vagrant box add ubuntu/trusty32 https://vagrantcloud.com/ubuntu/boxes/trusty32/versions/1/providers/virtualbox.box #required for vagrant 1.4.3
cd #to home directory
git clone https://github.com/Connoropolous/metamaps_gen002.git --branch develop
cd metamaps_gen002
vagrant up
vagrant ssh
 >  cd /vagrant
 >  rails server

===
IF YOU HAVE PROBLEMS:
===

One thing that might go wrong is with the Apache web server inside the virtual machine. You can try running the following commands:

vagrant ssh                 #enters the virtual machine
sudo service apache2 stop   #stops the normal Apache web server
cd /vagrant                 #moves to the code directory
bundle install              #just in case
rails server                #starts the simple rails Webrick server instead


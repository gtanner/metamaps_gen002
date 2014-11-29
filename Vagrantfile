Vagrant.configure("2") do |config|
  config.vm.box       = "precise32"
  config.vm.box_url   = "http://files.vagrantup.com/precise32.box"
  config.vm.hostname = "rails-base-box"
  config.vm.provider "virtualbox" do |v|
    v.customize ["modifyvm", :id, "--memory", "2048"]
    v.customize ["modifyvm", :id, "--cpus", "2"]
  end

  #enable this for faster synchronization
  #config.vm.synced_folder ".", "/vagrant", :nfs => true

  config.vm.network :forwarded_port, host: 3000, guest: 3000

  config.vm.provision :puppet do |puppet|
    puppet.manifests_path = "puppet/manifests"
    puppet.module_path    = "puppet/modules"
  end

  config.vm.provision :shell, :path => "puppet/after_puppet.sh"
end

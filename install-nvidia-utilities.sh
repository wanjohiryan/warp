#!/bin/bash
#This script installs nvidia-container-toolkit , nvidia-docker and cuda-11.8 needed to run warp/nvenc
# we assume that you are using ubuntu22.04 

set -xeo pipefail

trap 'trap " " SIGINT; kill -SIGINT 0; wait;' SIGINT SIGTERM

add-apt-repository ppa:graphics-drivers/ppa
apt update
apt install ubuntu-drivers-common

#log the drivers we just installed
ubuntu-drivers devices

apt install nvidia-driver-520

#create a temporary download folder
mkdir temp
cd temp

#download and install nvidia cuda-11.8
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
dpkg -i cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
cp /var/cuda-repo-ubuntu2204-11-8-local/cuda-*-keyring.gpg /usr/share/keyrings/
apt update
apt -y install cuda

#remove the temp folder
rm -rf temp

# Add CUDA path to ~/.bashrc
echo 'export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda-11.8/lib64' >> ~/.bashrc

# Reload the modified ~/.bashrc
source ~/.bashrc
ldconfig

#log out the nvidia cuda version
nvcc -V

# install nvidia-container-toolkit
apt-get update
apt-get install -y nvidia-container-toolkit-base

#log the nvidia-container-toolkit version installed
nvidia-ctk --version

#install nvidia-docker2

#remove any containers using nvidia-docker1 then install nvidia-docker2
docker volume ls -q -f driver=nvidia-docker | xargs -r -I{} -n1 docker ps -q -a -f volume={} | xargs -r docker rm -f
apt-get purge nvidia-docker
apt-get install nvidia-docker2
pkill -SIGHUP dockerd

#reboot for changes to take effect
reboot

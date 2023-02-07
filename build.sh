#!/bin/bash

set -xeo pipefail

#copy dockerfile into the root of the directory
cp .docker/base/Dockerfile .

#build and run docker
docker build -t wanjohiryan/warp:x264 .

#on build remove the Dockerfile, in case we create an 'example'
rm Dockerfile 

set -e
#run the image for 4 minutes
timeout 2m docker run wanjohiryan/warp:x264

sleep 60
killall vlc

exit 0
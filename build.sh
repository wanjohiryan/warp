#!/bin/bash

set -e
#run the image for 4 minutes
docker run wanjohiryan/warp:x264 &

sleep 20
kill %?docker

exit 0
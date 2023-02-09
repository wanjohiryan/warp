#!/bin/bash

set -xeo pipefail

f(){
  errorCode=$?
  echo "error $errorCode"
  echo "$BASH_COMMAND"
  echo "on line ${BASH_LINENO[0]}"

  exit $errorCode
}

trap -f ERR

#copy dockerfile into the root of the directory
cp examples/firefox/Dockerfile .

#build and run docker
docker build -t wanjohiryan/warp:firefox-x264 .

#on build remove the Dockerfile, in case we create an 'example'
rm Dockerfile 

#run the image for 4 minutes
docker run wanjohiryan/warp:firefox-x264 &

false

sleep 20
kill %?docker


exit 0
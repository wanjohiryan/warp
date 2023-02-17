#!/bin/bash

set -xeo pipefail

trap 'trap " " SIGINT; kill -SIGINT 0; wait;' SIGINT SIGTERM

YOUTUBE_URL="https://www.youtube.com/watch?v=mCCOz1dUz-Q"
SCREEN_WIDTH=1920
SCREEN_HEIGHT=1080

#Run the base entrypoint and wait for 10 seconds
source /etc/warp/entrypoint.sh &
sleep 10

#Create brave user directory
USER_DATA_DIR="/home/user/.config/brave-browser"
mkdir -p "$USER_DATA_DIR"

# Start Brave browser and play kygo
brave-browser \
  --user-data-dir="$USER_DATA_DIR" \
  --no-sandbox \
  --disable-background-networking \
  --disable-default-apps \
  --disable-extensions \
  --disable-gpu \
  --disable-sync \
  --disable-translate \
  --disable-web-security \
  --no-first-run \
  --noerrdialogs \
  --remote-debugging-port=9222 \
  --start-maximized \
  "https://www.youtube.com/watch?v=iFPMz36std4" &

#Do you like kygo? :)
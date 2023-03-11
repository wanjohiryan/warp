#!/bin/bash

set -xeo pipefail

SCREEN_WIDTH=1920
SCREEN_HEIGHT=1080

#Create brave user directory
USER_DATA_DIR="/home/$USER/.config/brave-browser"
mkdir -p "$USER_DATA_DIR"
sudo service dbus start

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
#!/bin/bash

set -xeo pipefail

trap '[[ -n $(jobs -p) ]] && kill $(jobs -p); echo "Error: Warp failed with exit code $?" >&2; [[ -n $(jobs -p) ]] && wait $(jobs -p); exit $?' ERR

#Start dbus for pulseaudio
sudo /etc/init.d/dbus start

#RUN x11 virtual framebuffer
SCREEN_RESOLUTION=1920x1080
DPI=96

echo "Starting Xvfb.."
Xvfb -dpi ${DPI} -screen 0 ${SCREEN_RESOLUTION}x16 ${DISPLAY} 2>&1 &
sleep 0.5 #ensure this has started before moving on

#Start pulseaudio
echo "Creating pulse audio  and sink..."
pulseaudio --fail -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=vsink #load a virtual sink as `vsink`
pacmd set-default-sink vsink
pacmd set-default-source vsink.monitor

#Start ffmpeg
echo "Starting ffmpeg"
source /etc/warp/ffmpeg.sh 2>&1 | awk '{ print "ffmpeg: " $0 }' &
sleep 1 #ensure this has started before moving on

#Generate selfsigned certs for warp
echo "Generating SSL certs..."
source /certs/generate-certs.sh 2>&1 | awk '{ print "generate-certs: " $0 }'

set -e
#Start warp server
echo "Starting server..."
/usr/bin/warp/warp &
sleep 1 #ensure this has started before moving on

set -e
#run child image entrypoint
echo "Running child scripts..."
# Set the directory where the other bash files are located
OTHER_SCRIPTS_DIR="/etc/warp/entrypoint.d"

# Check if the directory exists
if [ -d "$OTHER_SCRIPTS_DIR" ]; then
  # Loop through all the files in the directory
  for script_file in $OTHER_SCRIPTS_DIR/*.sh; do
    # Check if the file is a bash script and is executable
    if [ -x "$script_file" ] && [ "${script_file: -3}" == ".sh" ]; then
      # Run the script
      echo "Running script $script_file"
      SCRIPT_NAME=$(basename "$script_file" .sh)
      # Run the script and log the output to the console
      echo "Running script $script_file"
      bash "$script_file" 2>&1 | awk '{ print "'"$SCRIPT_NAME"': " $0 }' &
    fi
  done
else
  echo "Directory $OTHER_SCRIPTS_DIR not found " 
fi

wait -n

jobs -p | xargs --no-run-if-empty kill
wait

exit
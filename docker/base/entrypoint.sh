#!/bin/bash

set -xeo pipefail

trap '[[ -n $(jobs -p) ]] && kill $(jobs -p); echo "Error: Warp failed with exit code $?" >&2; [[ -n $(jobs -p) ]] && wait $(jobs -p); exit $?' ERR

#Start dbus for pulseaudio
sudo /etc/init.d/dbus start

#RUN x11 virtual framebuffer
SCREEN_RESOLUTION=1920x1080
DPI=96
LOG_DIR=/var/log/$USER

echo "Starting Xvfb.."
Xvfb -dpi ${DPI} -screen 0 ${SCREEN_RESOLUTION}x16 ${DISPLAY} 2>&1 &
sleep 0.5 #ensure this has started before moving on
echo "Xvfb was started succesfully"

#Start pulseaudio
echo "Creating pulse audio  and sink..."
pulseaudio --fail -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=vsink #load a virtual sink as `vsink`
pacmd set-default-sink vsink
pacmd set-default-source vsink.monitor
echo "Pulse audio socket and sink created"

#Start ffmpeg
echo "Starting ffmpeg"
source /etc/warp/ffmpeg.sh > $LOG_DIR/ffmpeg.log 2>&1 &
tail -f $LOG_DIR/ffmpeg.log | awk '{ print "ffmpeg: " $0 }' &
sleep 1 #ensure this has started before moving on
echo "Ffmpeg started succesfully"

#Generate selfsigned certs for warp
echo "Generating SSL certs..."
source /certs/generate-certs.sh 2>&1 | awk '{ print "generate-certs: " $0 }'
echo "SSL certs generated succesfully"

set -e
#Start warp server
echo "Starting server..."
/usr/bin/warp/warp > $LOG_DIR/warp.log 2>&1 &
tail -f $LOG_DIR/warp.log | awk '{ print "server: " $0 }' &
sleep 1 #ensure this has started before moving on
echo "Server started succesfully"

set -e
#run child image entrypoint
echo "Running child scripts..."
# Set the directory where the other bash files are located
OTHER_SCRIPTS_DIR="/etc/warp/entrypoint.d/"

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
      bash "$script_file" 2>&1 | awk '{ print "'"$SCRIPT_NAME"': " $0 }'
    fi
  done
else
  echo "Directory $OTHER_SCRIPTS_DIR not found " 
fi

wait -n

jobs -p | xargs --no-run-if-empty kill
wait

exit
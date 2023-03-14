#!/bin/bash

set -xeo pipefail

trap '[[ -n $(jobs -p) ]] && kill $(jobs -p); echo "Error: Warp failed with exit code $?" >&2; [[ -n $(jobs -p) ]] && wait $(jobs -p); exit $?' ERR

#Start dbus for pulseaudio
sudo /etc/init.d/dbus start

#create /dev/uinput directory
sudo mkdir -p /dev/input

# Create evdev node for gamepad
sudo mknod /dev/input/event0 c 13 64

# Set device permissions
sudo chmod 660 /dev/input/event0
sudo chown root:input /dev/input/event0

# sudo mkdir -p s/sys/class/input/event0/device

# Set device name
sudo echo "My Virtual Gamepad" > /sys/class/input/event0/device/name

# Set device capabilities
sudo echo -ne "\x01\x02\x60\x00" > /sys/class/input/event0/device/id/bustype # USB
sudo echo -ne "\x01\x02\x03\x04" > /sys/class/input/event0/device/id/vendor # Vendor ID
sudo echo -ne "\xAB\xCD\xEF\x01" > /sys/class/input/event0/device/id/product # Product ID
sudo echo 1 > /sys/class/input/event0/device/ff_effects_max # Enable force feedback

# Enable the device
sudo echo 1 > /sys/class/input/event0/device/enable

echo "Virtual gamepad created at /dev/input/event0"

#RUN x11 virtual framebuffer
SCREEN_RESOLUTION=1920x1080
DPI=96

Xvfb -dpi ${DPI} -screen 0 ${SCREEN_RESOLUTION}x16 ${DISPLAY} 2>&1 &
sleep 0.5 #ensure this has started before moving on

#Start pulseaudio
pulseaudio --fail -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=vsink #load a virtual sink as `vsink`
pacmd set-default-sink vsink
pacmd set-default-source vsink.monitor

#Start ffmpeg
source /etc/warp/ffmpeg.sh 2>&1 | awk '{ print "ffmpeg: " $0 }' &
sleep 1 #ensure this has started before moving on

#Generate selfsigned certs for warp
source /certs/generate-certs.sh 2>&1 | awk '{ print "generate-certs: " $0 }'

set -e
#Start warp server
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
      bash "$script_file"
    fi
  done
else
  echo "Directory $OTHER_SCRIPTS_DIR not found " 
fi

wait -n

jobs -p | xargs --no-run-if-empty kill
wait

exit
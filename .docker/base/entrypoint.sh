#!/bin/bash

set -xeo pipefail

trap 'trap " " SIGINT; kill -SIGINT 0; wait;' SIGINT SIGTERM

#Start dbus for pulseaudio
sudo /etc/init.d/dbus start

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
source /etc/warp/ffmpeg.sh &
sleep 0.7 #ensure this has started before moving on

#Start warp server
/usr/bin/warp/warp &

wait -n

jobs -p | xargs --no-run-if-empty kill
wait

exit
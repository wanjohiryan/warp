#!/bin/bash
#Highly inspired by https://github.com/selkies-project/docker-nvidia-glx-desktop/blob/main/entrypoint.sh
# The project is licensed under MPL v2.0
#Thanks ehfd :)

trap '[[ -n $(jobs -p) ]] && kill $(jobs -p); echo "Error: Warp failed with exit code $?" >&2; [[ -n $(jobs -p) ]] && wait $(jobs -p); exit $?' ERR

# Modify permissions of XDG_RUNTIME_DIR
sudo -u $USER mkdir -pm700 /tmp/runtime-user
sudo chown $USER:$USER /tmp/runtime-user
sudo chmod 700 /tmp/runtime-user

# Remove directories to make sure the desktop environment starts
sudo rm -rf /tmp/.X* ~/.cache

#Start dbus for pulseaudio
sudo /etc/init.d/dbus start

# Change time zone from environment variable
sudo ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" | sudo tee /etc/timezone >/dev/null

# Add game directories for VirtualGL directories to path
export PATH="${PATH}:/usr/games:/opt/VirtualGL/bin"

# Add CUDA library path
export LD_LIBRARY_PATH="/usr/local/cuda/lib64:${LD_LIBRARY_PATH}"

# Run Xvfb server with required extensions
echo "Starting Xvfb..."
Xvfb "${DISPLAY}" -ac -screen "0" "8192x4096x24" -dpi "96" +extension "RANDR" +extension "GLX" +iglx +extension "MIT-SHM" +render -nolisten "tcp" -noreset -shmem &
sleep 0.5

# Wait for X11 to start
echo "Waiting for X socket"
until [ -S "/tmp/.X11-unix/X${DISPLAY/:/}" ]; do sleep 1; done
echo "X socket is ready"

#Start pulseaudio
pulseaudio --fail -D --exit-idle-time=-1
pacmd load-module module-virtual-sink sink_name=vsink #load a virtual sink as `vsink`
pacmd set-default-sink vsink
pacmd set-default-source vsink.monitor

#Start ffmpeg
source /etc/warp/ffmpeg.sh 2>&1 | awk '{ print "ffmpeg: " $0 }' &
sleep 10 #ensure this has started before moving on

set -e
#Start warp server
/usr/bin/warp/warp &
sleep 1 #ensure this has started before moving on

#create a non-root wineprefix
export WINEPREFIX=/home/$USER/.local/share/wineprefixes/warp
export WINEARCH=win64

winetricks prefix=warp arch=64

#Make win10 the default wine version
$WINEPREFIX winetricks win10

if [[ -z "${GAME_EXE}" ]]; then
  echo "The GAME_EXE environment variable is not set. Exiting."
  exit 0
fi

set -e
#run child image entrypoint
echo "Running executable..."

# sudo chown $USER:$USER /data

# Use VirtualGL to run wine with OpenGL if the GPU is available, otherwise use barebone wine
if [ -n "$(nvidia-smi --query-gpu=uuid --format=csv | sed -n 2p)" ]; then
  export VGL_DISPLAY="${VGL_DISPLAY:-egl}"
  export VGL_REFRESHRATE="$REFRESH"

  echo "Nvidia GPU detected..."
  if [[ "${GAME_EXE}" == *".exe" ]]; then
    $WINEPREFIX $WINEARCH vglrun +wm wine64 "/game/${GAME_EXE}"
  else
    vglrun +wm "/game/${GAME_EXE}"
  fi
else
  echo "No Nvidia GPU detected..."
  if [[ "${GAME_EXE}" == *".exe" ]]; then
    $WINEPREFIX $WINEARCH wine64 "/game/${GAME_EXE}"
  else
    "/game/${GAME_EXE}"
  fi
fi

wait -n

jobs -p | xargs --no-run-if-empty kill
wait

exit

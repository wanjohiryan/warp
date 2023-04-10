#!/bin/bash

game_path="$1"

if [[ -z "${game_path}" ]]; then
    echo "Error: File not found: $game_path"
    exit 1
fi

//TODO: Fix this check, and use go instead of bash
# Check if game is already running
if pgrep -x "$(basename "$game_path")" >/dev/null; then
    echo "Game is already running"
    exit 0
fi

set -e
#run child image entrypoint
echo "Running executable..."

# Use VirtualGL to run wine with OpenGL if the GPU is available, otherwise use barebone wine
if [ -n "$(nvidia-smi --query-gpu=uuid --format=csv | sed -n 2p)" ]; then
    export VGL_DISPLAY="${VGL_DISPLAY:-egl}"
    export VGL_REFRESHRATE="$REFRESH"

    echo "Nvidia GPU detected..."
    if [[ "${game_path}" == *".exe" ]]; then
        vglrun +wm wine "/game/${game_path}"
    else
        vglrun +wm "/game/${game_path}"
    fi
else
    echo "No Nvidia GPU detected..."
    if [[ "${game_path}" == *".exe" ]]; then
        wine "/game/${game_path}"
    else
        "/game/${game_path}"
    fi
fi

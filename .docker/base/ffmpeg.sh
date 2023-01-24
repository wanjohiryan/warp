#!/bin/bash

#TODO: Add support for env directory for playlist.mpd

ffmpeg -r 30 -f x11grab -draw_mouse 0 \
    -s "$SWIDTH"x"$SHEIGHT" -i "$DISPLAY" \
    -f pulse -re -i default -c:a libopus \
	-c:v libx264 \
    -preset veryfast -tune zerolatency \
	-c:a aac \
	-b:a 128k -ac 2 -ar 44100 \
	-map v:0 -s:v:0 1280x720 -b:v:0 3M   \
	-map v:0 -s:v:1 854x480  -b:v:1 1.1M \
	-map v:0 -s:v:2 640x360  -b:v:2 365k \
	-map 0:a \
	-force_key_frames "expr:gte(t,n_forced*2)" \
	-sc_threshold 0 \
	-streaming 1 \
	-use_timeline 0 \
	-seg_duration 2 -frag_duration 0.01 \
	-frag_type duration \
	playlist.mpd

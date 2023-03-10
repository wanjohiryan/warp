#!/bin/bash

set -xeuo pipefail

CMD=(
    ffmpeg
    -hide_banner
    -loglevel error
    #disable interaction via stdin
    -nostdin
    #screen image size
    -s 1920x1080
    #video fps
    -r 30
    -draw_mouse 0
    #grab x11 display
    -f x11grab
        -i ${DISPLAY}
    #capture pulse audio
    -f pulse
        -ac 2
        -i default
    -c:v libx264 
        -preset veryfast
        -tune zerolatency
        -profile main
        -pix_fmt yuv420p #let us use 4:2:0 for now 
        #full color 4:4:4 causes an error in warp
    -c:a aac
        -b:a 128k
        -ar 44100
        -ac 2
    -map v:0 -s:v:0 1280x720 -b:v:0 3M
    -map v:0 -s:v:1 854x480  -b:v:1 1.1M
    -map v:0 -s:v:2 640x360  -b:v:2 365k
    -map 1:a
    -force_key_frames "expr:gte(t,n_forced*2)"
    -sc_threshold 0
    -streaming 1
    -use_timeline 0
    -seg_duration 2
    -frag_duration 0.01
    -frag_type duration
    -movflags frag_keyframe+empty_moov

    #FIXME: Use remote server instead and pass in the rtmp url here. 
    #This /media directory could potentially get too large during long sessions
    /media/playlist.mpd
)

exec "${CMD[@]}"
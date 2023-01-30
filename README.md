# Warp

Segmented live media delivery protocol utilizing QUIC streams. See the [Warp draft](https://datatracker.ietf.org/doc/draft-lcurley-warp/).

Warp works by delivering each audio and video segment as a separate QUIC stream. These streams are assigned a priority such that old video will arrive last and can be dropped. This avoids buffering in many cases, offering the viewer a potentially better experience.

> This is a fork of [Warp by luke](https://github.com/kixelated/warp-demo) with my personal tweaks

# YouTube Presentation

[![Luke's Warp Presentation at Demuxed](https://img.youtube.com/vi/hG0nmy3Otg4/0.jpg)](https://www.youtube.com/watch?v=hG0nmy3Otg4)

## Possible use cases:

1. Streaming a Graphical User Interface from docker containers to web browsers using a single UDP port

## Features:

1. Exposes a single port, which is especially useful for scaling docker containers with K8s
2. Unlike WebRTC, supports both server-to-client architecture(s) as well as peer-to-peer
3. Encrypted and secure end-to-end connections by default
4. Faster handshake, 1RTT, which is especially useful for mobile-first applications
5. Roaming support
6. Congestion Control
7. Load balancing

## Browser Support

Warp currently only works on Chrome for two reasons:

1. WebTransport support.
2. WebCodecs.


>Warp currently uses [Media underflow behavior](https://github.com/whatwg/html/issues/6359) but will soon be deprecated in favor of WebCodecs-plus-canvas

The ability to skip video abuses the fact that Chrome can play audio without video for up to 3 seconds (hardcoded!) when using MSE. It is possible to use something like WebCodecs instead... but that's still Chrome only at the moment.

### Benchmarks
[WebRTC vs WebSocket vs WebTransport](https://github.com/Sh3B0/realtime-web)

<!-- ## Congestion Control
This demo uses a single rendition. A production implementation will want to:

1. Change the rendition bitrate to match the estimated bitrate.
2. Switch renditions at segment boundaries based on the estimated bitrate.
3. or both!

Also, quic-go ships with the default New Reno congestion control. Something like [BBRv2](https://github.com/lucas-clemente/quic-go/issues/341) will work much better for live video as it limits RTT growth. -->

# Setup

To use this image(s) in your project import in your Dockerfile like,

 `FROM wanjohiryan/warp:x264.{version}`

Valid values of `{version}` are:

| Value | Description |
|---|------|
| {major} (semver) | use a specific major release |
| {major}.{minor} (semver)| use a specific version with patches |
| latest | use the current stable version |
| nightly | use the current nightly build, not stable at all |

Example:
```bash
FROM wanjohiryan/warp:x264.0 #major release

FROM wanjohiryan/warp:x264.0.2.1 #current version

FROM wanjohiryan/warp:x264.latest #latest stable release

FROM wanjohiryan/warp:x264.nightly #use the nightly build, stability is not a guarantee

```


## Requirements
To run the example `chrome-x264` which uses h264 software endering(no need for a GPU), you will need:

* Docker engine v20.10.23 or higher

```bash
docker run -p 8080:8080/udp wanjohiryan/warp:chrome-x264.0.2.1 # or ghcr.io/wanjohiryan/warp/chrome-x264:0.2.1
```

> **NOTE** this example docker image versioning rule highlighted earlier

We need to run a *fresh instance* of Chrome, instructing it to force QUIC streaming to our port. This command will not work if Chrome is already running, so it's easier to use Chrome instead.

Launch a new instance of Chrome:

```bash
/path/to/chrome.exe --origin-to-force-quic-on=localhost:8080 https://localhost:8080
```

To get `path/to/chrome.exe` use `chrome://version`


Then access the webpage on `https://localhost:8080` by default.

>**Note**
>To you use a custom domain for the Warp server, make sure to override the server URL with the `url` query string parameter, e.g. `https://localhost:8080/?url=https://warp.server.com`.



>All this couldn't have been made possible without Luke sharing sharing his code:
✨✨Thanks Luke✨✨

# TODO

 - Support various encodings:
   - [ ] nvenc for nvidia HW acceleration
   - [x] x264 software-rendering
   - [ ] vaapi for AMD/Intel HW acceleration
 - Create examples to showcase features:
    - [x] chrome with x264
    - [ ] chrome with nvenc
    - [ ] chrome with vaapi
 - Add uinput support:
    - [ ] keyboard and mouse
    - [ ] gamepads
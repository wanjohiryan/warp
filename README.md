<h3 align="center">

![Warp Logo](/imgs/warp-dark.png#gh-light-mode-only)

![Warp Logo](/imgs/warp-light.png#gh-dark-mode-only)

</h3>

<div align="center">
   <a href="https://discord.com/invite/Y6etn3qKZ3">
      <img src="https://discordapp.com/api/guilds/1080111004698021909/widget.png?style=shield" alt="Chat on discord">
    </a>
  <a href="https://github.com/wanjohiryan/warp/releases">
      <img src="https://img.shields.io/github/v/release/wanjohiryan/warp" alt="release">
    </a>
  <a href="https://github.com/wanjohiryan/warp">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" alt="PRs welcome!" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/commit-activity/m/wanjohiryan/warp" alt="git commit activity" />
  </a>

Segmented live media delivery protocol utilizing QUIC streams. See the [MoQ draft](https://datatracker.ietf.org/doc/draft-lcurley-warp/)

</div>

# How It Works

- [Luke Curley - Low-Latency Video over QUIC](https://www.youtube.com/watch?v=hG0nmy3Otg4)  Uploaded: 26th Dec 2021

- [Live Media Over QUIC | Luke Curley](https://www.youtube.com/watch?v=hG0nmy3Otg4)  Uploaded: 4th May 2023

> **TLDR:** Warp works by delivering each audio and video segment as a separate QUIC stream. These streams are assigned a priority such that old video will arrive last and can be dropped. This avoids buffering in many cases, offering the viewer a potentially better experience.

## Possible use cases:

- Streaming a Graphical User Interface to web browsers using a single UDP port and with hardware acceleration. See [Arc3dia](https://github.com/wanjohiryan/arc3dia)
- Streaming movies from a remote Plex or Jellyfin server

... and many more
## Features:

1. Exposes a single port (443/udp, 443/tcp), which is especially useful when scaling docker containers
2. Encrypted and secure end-to-end connections by default
3. Faster handshake, 1RTT, which is especially useful for mobile-first applications
4. Roaming support
5. Congestion Control

# Special Thanks
This project could not have been possible without the great work done by:

 | <a href="https://github.com/kixelated"><img src="https://avatars.githubusercontent.com/u/432854?v=4" width="50" height="50" alt=""/> | </a><a href="https://github.com/englishm"><img src="https://avatars.githubusercontent.com/u/1165411?v=4" width="50" height="50" alt=""/></a> |
| :---: | :---: |
# DOCS

_**WIP**_


# License
This project is licensed under **Mozilla Public License, v2.0**
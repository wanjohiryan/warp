#
#   Build warp golang

FROM golang:1.20-bullseye as warp

WORKDIR /src

#
# install mkcert
#
RUN apt-get update; \
    apt install libnss3-tools -y;\
    wget -nv -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64; \
    chmod +x /usr/local/bin/mkcert;


COPY ./ .

#
#make self signed certs
#
RUN chmod +x ./certs/generate.sh && ./certs/generate.sh

#
# build executable
#
RUN go build

#
# STAGE 2: RUNTIME
#
FROM ubuntu:20.04

#
# avoid warnings by switching to noninteractive
#
ENV DEBIAN_FRONTEND=noninteractive

#
# set custom user
#
ARG USERNAME=warp
ARG USER_UID=1000
ARG USER_GID=$USER_UID


RUN set -eux;\
    apt update; \
    #
    # Install dependencies
    #
    apt-get install --no-install-recommends --assume-yes wget ca-certificates software-properties-common gpg-agent supervisor xvfb mingw-w64 dbus-x11 cabextract aptitude vim pulseaudio; \
    #
    # clean up
    #
    apt-get clean -y; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*
#
#Install ffmpeg5
#
RUN set -eux; \
        apt update; \
        apt upgrade -y; \
        add-apt-repository ppa:savoury1/ffmpeg4 -y ; \
        add-apt-repository ppa:savoury1/ffmpeg5 -y ;\
        apt update; \
        apt upgrade -y;\
        apt install --no-install-recommends --assume-yes ffmpeg; \
        #
        # clean up
        #
        apt clean -y; \
        rm -rf /var/lib/apt/lists/* /var/cache/apt/* ;\
         #
         #check version
         #
        ffmpeg -version

RUN set -eux; \
    apt-get update; \
    #
    # create a non-root user
    #
    groupadd --gid $USER_GID $USERNAME; \
    useradd --uid $USER_UID --gid $USERNAME --shell /bin/bash --create-home $USERNAME; \
    adduser $USERNAME audio; \
    adduser $USERNAME video; \
    adduser $USERNAME pulse; \
    #
    # setup pulseaudio
    #
    mkdir -p /home/$USERNAME/.config/pulse/; \
    echo "default-server=unix:/tmp/pulseaudio.socket" > /home/$USERNAME/.config/pulse/client.conf; \
    #
    # workaround for an X11 problem: http://blog.tigerteufel.de/?p=476
    mkdir /tmp/.X11-unix; \
    chmod 1777 /tmp/.X11-unix; \
    chown $USERNAME /tmp/.X11-unix/; \
    #
    # make directories for warp
    #
    mkdir -p /etc/warp /var/log/warp; \
    chmod 1777 /var/log/warp; \
    chown $USERNAME /var/log/warp/; \
    chown -R $USERNAME:$USERNAME /home/$USERNAME; \
    #
    # clean up
    #
    apt-get clean -y; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#
# copy config files
#
COPY .docker/x264-base/supervisord.conf /etc/warp/supervisord.conf
RUN chmod 755 /etc/warp/supervisord.conf

#
#set default envs
#
ENV DISPLAY=:99.0
ENV DPI 96
ENV SHEIGHT 1080
ENV SWIDTH 1920
ENV USER=$USERNAME

#
# copy static files from previous stage
#
COPY --from=warp /src /usr/bin/warp
COPY .docker/x264-base/ffmpeg.sh /usr/bin/warp/media/ffmpeg.sh
RUN chmod 755 /usr/bin/warp/media/ffmpeg.sh

#
# expose port 8080 for QUIC streams
#
EXPOSE 8080/udp

#
# run supervisord
#
CMD ["/usr/bin/supervisord", "-c", "/etc/warp/supervisord.conf"]


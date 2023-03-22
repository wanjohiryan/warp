FROM ubuntu:20.04

LABEL maintainer https://github.com/wanjohiryan

SHELL [ "/bin/bash","-o", "pipefail", "-c" ]

ARG DEBIAN_FRONTEND=noninteractive

ARG USERNAME=warp
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

#
#Install dependencies
#
RUN apt-get update; \ 
    apt-get -y upgrade;\
    apt-get install --assume-yes --no-install-recommends \ 
    sudo software-properties-common ca-certificates gnupg libnss3-tools \
    wget curl vim pulseaudio xvfb dbus-x11 libdbus-c++-1-0v5; \
    #
    #clean up
    #
    rm -rf /var/lib/apt/lists/*

#
#Install ffmpeg5
#
RUN apt update; \ 
    apt upgrade -y; \
    add-apt-repository ppa:savoury1/ffmpeg4 -y; \
    add-apt-repository ppa:savoury1/ffmpeg5 -y; \
    apt update; \
    apt upgrade -y; \
    apt install --no-install-recommends --assume-yes ffmpeg; \
    #
    #clean up
    #
    apt clean -y; \ 
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#
# install mkcert
#
RUN apt-get update; \
    wget -nv -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64; \
    chmod +x /usr/local/bin/mkcert;

RUN apt-get update; \
    #
    #create a non-root user
    #
    groupadd --gid ${USER_GID} ${USERNAME}; \
    useradd --uid ${USER_UID} --gid ${USERNAME} --shell /bin/bash --create-home ${USERNAME};\
    usermod -a -G adm,audio,pulse-access,sudo,tty,video ${USERNAME} ;\
    echo "${USERNAME} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers; \
    #
    #make directories for warp
    #
    mkdir -p /etc/warp /certs /media /usr/bin/warp /etc/warp/entrypoint.d;\
    chmod 1777 /certs /media /usr/bin/warp /etc/warp/entrypoint.d; \
    chown ${USERNAME} /certs /usr/bin/warp /etc/warp/entrypoint.d /media; \
    chown -R $USERNAME:$USERNAME /home/${USERNAME}

#
#Make directories for x-server
#
RUN mkdir /tmp/.X11-unix; \
    chmod 1777 /tmp/.X11-unix; \
    chown ${USERNAME} /tmp/.X11-unix/

#
#Install tini Reference:https://github.com/krallin/tini
#
ARG TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /usr/bin/tini
RUN chmod +x /usr/bin/tini
ENTRYPOINT [ "/usr/bin/tini","--" ]

#
#Copy config files
#
COPY docker/base/entrypoint.sh /etc/warp/entrypoint.sh
RUN chmod +x /etc/warp/entrypoint.sh

COPY docker/base/generate-certs.sh /certs/generate-certs.sh
RUN chmod +x /certs/generate-certs.sh

COPY docker/base/ffmpeg.sh /etc/warp/ffmpeg.sh
RUN chmod +x /etc/warp/ffmpeg.sh

COPY gpad.exe /etc/warp/gpad.exe

COPY warp /usr/bin/warp/warp
RUN chmod +x /usr/bin/warp/warp


ENV USER ${USERNAME}
ENV SHELL /bin/bash
ENV DISPLAY=:99.0

EXPOSE 8080/udp

#
#Run as user `Warp`
#
USER ${USERNAME}

CMD [ "/etc/warp/entrypoint.sh" ]
#! Highly inspired by https://github.com/selkies-project/docker-nvidia-glx-desktop/blob/main/Dockerfile 
#! The project is licensed under MPL v2.0
#Thanks ehfd :)


#
#   Build warp golang
#
FROM golang:1.18-bullseye as warp

WORKDIR /src

COPY ./  .
# COPY  go.mod main.go go.sum ./

#
# build executable
#
RUN go build

#
# STAGE 2: RUNTIME
#
#Use cuda 11.7 for backwards compatibility with hosts that have >=v11.7
#
FROM nvcr.io/nvidia/cuda:11.7.1-runtime-ubuntu22.04

ARG CUDA_VERSION

LABEL maintainer "https://github.com/wanjohiryan"

SHELL [ "/bin/bash","-o", "pipefail", "-c" ]

ARG DEBIAN_FRONTEND=noninteractive

ARG USERNAME=warp
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

# Enable AppImage execution in a container
ENV APPIMAGE_EXTRACT_AND_RUN 1

ENV VGL_DISPLAY egl
ENV REFRESH 60

#make all nvidia gpus visible and allow all capabilities
ARG NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES all

ENV LD_LIBRARY_PATH /usr/lib/x86_64-linux-gnu:/usr/lib/i386-linux-gnu${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
ENV XDG_RUNTIME_DIR /tmp/runtime-user

#
# Install locales to prevent X11 errors
#
RUN apt-get clean && \
    apt-get update && apt-get install --no-install-recommends -y locales && \
    rm -rf /var/lib/apt/lists/* && \
    locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

#
#Install dependencies
#
RUN dpkg --add-architecture i386 && apt-get update; \ 
    apt-get -y upgrade;\
    apt-get install --assume-yes --no-install-recommends \ 
    sudo software-properties-common ca-certificates gnupg xvfb libnss3-tools \
    wget curl vim pulseaudio  dbus-x11 libdbus-c++-1-0v5\
    alsa-base alsa-utils apt-transport-https apt-utils build-essential ca-certificates \
    curl file wget bzip2 gzip p7zip-full xz-utils zip \
    unzip zstd gcc git jq make mlocate nano vim \
    htop libpulse0 pulseaudio supervisor net-tools libglvnd-dev libglvnd-dev:i386 \
    libgl1-mesa-dev libgl1-mesa-dev:i386 libegl1-mesa-dev libegl1-mesa-dev:i386 libgles2-mesa-dev \
    libgles2-mesa-dev:i386 libglvnd0 libglvnd0:i386 libgl1 libgl1:i386 libglx0 libglx0:i386 libegl1 \
    libegl1:i386 libgles2 libgles2:i386 libglu1 libglu1:i386 libsm6 libsm6:i386 \
    vainfo vdpauinfo pkg-config mesa-utils mesa-utils-extra va-driver-all \
    xserver-xorg-input-all xserver-xorg-video-all mesa-vulkan-drivers libvulkan-dev \
    libvulkan-dev:i386 libxau6 libxau6:i386 libxdmcp6 libxdmcp6:i386 libxcb1 libxcb1:i386 \
    libxext6 libxext6:i386 libx11-6 libx11-6:i386 libxv1 libxv1:i386 libxtst6 libxtst6:i386 \
    xdg-utils dbus-x11 libdbus-c++-1-0v5 xkb-data x11-xkb-utils x11-xserver-utils x11-utils \ 
    x11-apps xauth xbitmaps xinit libxrandr-dev;\
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
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#
#Install and configure Vulkan and EGL manually
#
RUN  wget -qO - http://packages.lunarg.com/lunarg-signing-key-pub.asc | apt-key add - ;\
    wget -qO /etc/apt/sources.list.d/lunarg-vulkan-focal.list http://packages.lunarg.com/vulkan/lunarg-vulkan-focal.list ;\
    apt update -y; \
    apt install --no-install-recommends -y vulkan-sdk; \
    rm -rf /var/lib/apt/lists/*; \
    #
    # Configure EGL manually
    mkdir -p /usr/share/glvnd/egl_vendor.d/; \
    echo "{\n\
    \"file_format_version\" : \"1.0.0\",\n\
    \"ICD\": {\n\
        \"library_path\": \"libEGL_nvidia.so.0\"\n\
    }\n\
}" > /usr/share/glvnd/egl_vendor.d/10_nvidia.json; \
    VULKAN_API_VERSION=$(dpkg -s libvulkan1 | grep -oP 'Version: [0-9|\.]+' | grep -oP '[0-9]+(\.[0-9]+)(\.[0-9]+)'); \
    mkdir -p /etc/vulkan/icd.d/; \
    echo "{\n\
    \"file_format_version\" : \"1.0.0\",\n\
    \"ICD\": {\n\
        \"library_path\": \"libGLX_nvidia.so.0\",\n\
        \"api_version\" : \"${VULKAN_API_VERSION}\"\n\
    }\n\
}" > /etc/vulkan/icd.d/nvidia_icd.json

#
#Install Virtualgl and make libraries available for preload
#
ARG VIRTUALGL_URL="https://sourceforge.net/projects/virtualgl/files"
ARG VIRTUALGL_VERSION=3.0.2
RUN curl -fsSL -O "${VIRTUALGL_URL}/virtualgl_${VIRTUALGL_VERSION}_amd64.deb"; \
    curl -fsSL -O "${VIRTUALGL_URL}/virtualgl32_${VIRTUALGL_VERSION}_amd64.deb"; \
    apt-get update && apt-get install -y --no-install-recommends ./virtualgl_${VIRTUALGL_VERSION}_amd64.deb ./virtualgl32_${VIRTUALGL_VERSION}_amd64.deb; \
    rm -f "virtualgl_${VIRTUALGL_VERSION}_amd64.deb" "virtualgl32_${VIRTUALGL_VERSION}_amd64.deb"; \
    rm -rf /var/lib/apt/lists/*; \
    chmod u+s /usr/lib/libvglfaker.so; \
    chmod u+s /usr/lib/libdlfaker.so; \
    chmod u+s /usr/lib32/libvglfaker.so; \
    chmod u+s /usr/lib32/libdlfaker.so; \
    chmod u+s /usr/lib/i386-linux-gnu/libvglfaker.so; \
    chmod u+s /usr/lib/i386-linux-gnu/libdlfaker.so

#
# install mkcert
#
RUN apt-get update; \
    wget -nv -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64; \
    chmod +x /usr/local/bin/mkcert;

#
#Make joystick nodes
#
RUN apt-get update; \
    apt-get install -y udev;\
    mkdir -p /dev/input/;\
    #
    #make evdev nodes for our gamepad(s). Max number is 4
    mknod /dev/input/event0 c 13 63; \
    mknod /dev/input/event1 c 13 64; \
    mknod /dev/input/event2 c 13 65; \
    mknod /dev/input/event3 c 13 66; \
    chown root:input /dev/input/event0 /dev/input/event1 /dev/input/event2 /dev/input/event3; \
    chmod 660 /dev/input/event0 /dev/input/event1 /dev/input/event2 /dev/input/event3;

#
#Create a non-root user Warp
#
RUN apt-get update; \
    #
    #create a non-root user
    #
    groupadd --gid ${USER_GID} ${USERNAME}; \
    useradd --uid ${USER_UID} --gid ${USERNAME} --shell /bin/bash --create-home ${USERNAME};\
    usermod -a -G adm,audio,input,pulse-access,sudo,tty,video ${USERNAME} ;\
    echo "${USERNAME} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers; \
    #
    #make directories for warp
    #
    mkdir -p /etc/warp /certs /media /usr/bin/warp /etc/warp/entrypoint.d;\
    chmod 1777 /certs /media /usr/bin/warp /etc/warp/entrypoint.d; \
    chown ${USERNAME} /certs /usr/bin/warp /etc/warp/entrypoint.d /media; \
    chown -R $USERNAME:$USERNAME /home/${USERNAME} ;\
    ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

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
COPY docker/nvidia/entrypoint.sh /etc/warp/entrypoint.sh
RUN chmod +x /etc/warp/entrypoint.sh

COPY docker/nvidia/generate-certs.sh /certs/generate-certs.sh
RUN chmod +x /certs/generate-certs.sh

COPY docker/nvidia/ffmpeg.sh /etc/warp/ffmpeg.sh
RUN chmod +x /etc/warp/ffmpeg.sh

COPY --from=warp /src /usr/bin/warp


ENV USER ${USERNAME}
ENV SHELL /bin/bash
ENV DISPLAY=:0

EXPOSE 8080/udp

#
#Run as user `Warp`
#
USER ${USERNAME}
WORKDIR /home/${USERNAME}


CMD [ "/etc/warp/entrypoint.sh" ]
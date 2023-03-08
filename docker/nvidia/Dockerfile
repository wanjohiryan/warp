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
#Use cuda 11.7 for backwards compatibility with hosts that have >=v11.6
#
FROM nvcr.io/nvidia/cuda:11.7.1-runtime-ubuntu22.04

ARG CUDA_VERSION

LABEL maintainer "https://github.com/wanjohiryan"

SHELL [ "/bin/bash","-o", "pipefail", "-c" ]

ARG DEBIAN_FRONTEND=noninteractive

ARG USERNAME=warp
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

#make all nvidia gpus visible and allow all capabilities
ARG NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES all
ENV LD_LIBRARY_PATH /usr/lib/x86_64-linux-gnu:/usr/lib/i386-linux-gnu${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
ENV XDG_RUNTIME_DIR /tmp/runtime-user

#
#Install dependencies
#
RUN dpkg --add-architecture i386 && apt-get update; \ 
    apt-get -y upgrade;\
    apt-get install --assume-yes --no-install-recommends \ 
    sudo software-properties-common ca-certificates gnupg libnss3-tools \
    wget curl vim pulseaudio  dbus-x11 libdbus-c++-1-0v5\
    xorg xauth x11-utils kmod libc6-dev libc6:i386 libpci3  libelf-dev \
    mesa-vulkan-drivers mesa-utils-extra mesa-utils\
    libglvnd-dev libglvnd-dev:i386 libgl1-mesa-dev libgl1-mesa-dev:i386 libegl1-mesa-dev \
    libegl1-mesa-dev:i386 libgles2-mesa-dev libgles2-mesa-dev:i386 libglvnd0 \
    libglvnd0:i386 libgl1 libgl1:i386 libglx0 libglx0:i386 libegl1 libegl1:i386 libgles2 \
    libgles2:i386 libglu1 libglu1:i386 libsm6 libsm6:i386; \
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
#Install and configure Vulkan
#

RUN  apt-get install --no-install-recommends -y vulkan-tools; \
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
    mkdir -p /etc/warp /certs/ /media/ /usr/bin/warp /etc/warp/entrypoint.d/;\
    chmod 1777 /certs/; \
    chmod 1777 /media/; \
    chmod 1777 /usr/bin/warp; \
    chmod 1777 /etc/warp/entrypoint.d/; \
    chown ${USERNAME} /certs/; \
    chown ${USERNAME} /usr/bin/warp/; \
    chown ${USERNAME} /etc/warp/entrypoint.d/; \
    chown ${USERNAME} /media/; \
    chown -R $USERNAME:$USERNAME /home/${USERNAME}

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

COPY docker/nvidia/run-bash.sh /etc/warp/run-bash.sh
RUN chmod +x /etc/warp/run-bash.sh

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

CMD [ "/etc/warp/entrypoint.sh" ]
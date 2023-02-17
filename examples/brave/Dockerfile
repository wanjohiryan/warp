#
#Import from base
#

ARG WARP_IMAGE=ghcr.io/wanjohiryan/warp/x264:nightly
FROM $WARP_IMAGE

#
#Install brave
#
# Add Brave Browser repository and key
RUN wget -qO - https://brave-browser-apt-release.s3.brave.com/brave-core.asc | apt-key add - ;\
    echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | tee /etc/apt/sources.list.d/brave-browser-release.list; \
    apt-get update && apt-get install -y brave-browser

COPY examples/brave/brave.sh /etc/warp/brave.sh
RUN  chmod +x /etc/warp/brave.sh

#
#Run as user `Warp`
#
USER ${USERNAME}

ENTRYPOINT [ "/usr/bin/tini","--", "/etc/warp/brave.sh" ]


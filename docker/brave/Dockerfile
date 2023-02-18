#
#Import from base
#

ARG WARP_IMAGE=ghcr.io/wanjohiryan/warp/x264:nightly
FROM $WARP_IMAGE

#
#Install brave
#
# Add Brave Browser repository and key
RUN wget -qO - https://brave-browser-apt-release.s3.brave.com/brave-core.asc | sudo apt-key add - ;\
    echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list; \
    sudo apt-get update && sudo apt-get install -y brave-browser; \
    #
    # clean up
    #
    sudo apt-get clean -y; \
    sudo rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#
#Copy entrypoint into a directory the parent entrypoint will see
#
COPY docker/brave/brave.sh /etc/warp/entrypoint.d/brave.sh
RUN  sudo chmod +x /etc/warp/entrypoint.d/brave.sh

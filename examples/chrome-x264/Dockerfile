#
#Import from base
#
FROM wanjohiryan/warp:h264


#
#Install chrome
#
ARG CHROME_SRC="https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"

RUN set -eux; apt-get update; \
    wget -O /tmp/google-chrome.deb "${CHROME_SRC}"; \
    apt-get install -y --no-install-recommends openbox /tmp/google-chrome.deb; \
    #
    # clean up
    #
    apt-get clean -y; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*
#
# config files   
COPY examples/chrome-x264/supervisord.conf /etc/warp/supervisord/chrome.conf
COPY --chown=warp examples/chrome-x264/preferences.json /home/warp/.config/google-chrome/Default/Preferences
COPY examples/chrome-x264/policies.json /etc/opt/chrome/policies/managed/policies.json
COPY examples/chrome-x264/openbox.xml /etc/warp/openbox.xml
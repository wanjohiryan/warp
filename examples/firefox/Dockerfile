#
#Import from base
#

ARG WARP_IMAGE=ghcr.io/wanjohiryan/warp/x264:nightly
FROM $WARP_IMAGE

#
#Install fonts
#
RUN apt-get update;\
        apt-get upgrade;\
        sudo apt-get install -y   libfontconfig \
            libfreetype6 \
            xfonts-cyrillic \
            xfonts-scalable \
            fonts-liberation \
            fonts-ipafont-gothic \
            fonts-wqy-zenhei \
            unzip   \
            firefox

ARG TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT [ "/tini","--" ]

#
#Install chrome
#
RUN  curl -s http://ciscobinary.openh264.org/openh264-linux64-2e1774ab6dc6c43debb0b5b628bdf122a391d521.zip -o /tmp/openh264-1.8.1.1.zip && \
    chmod a+r /tmp/openh264-1.8.1.1.zip

COPY examples/firefox/firefox.sh /etc/warp/firefox.sh
RUN sudo chmod +x /etc/warp/firefox.sh


CMD [ "/etc/warp/firefox.sh" ]

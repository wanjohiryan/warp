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
        apt-get install -y   libfontconfig \
            libfreetype6 \
            xfonts-cyrillic \
            xfonts-scalable \
            fonts-liberation \
            fonts-ipafont-gothic \
            fonts-wqy-zenhei \
            firefox

USER root
#
#Install chrome
#
RUN curl -s http://ciscobinary.openh264.org/openh264-linux64-2e1774ab6dc6c43debb0b5b628bdf122a391d521.zip -o /openh264-1.8.1.1.zip && \
    chmod a+r /openh264-1.8.1.1.zip

COPY examples/firefox/firefox.sh /etc/warp/firefox.sh
RUN chmod +x /etc/warp/firefox.sh

USER ${USERNAME}

CMD [ "/etc/warp/firefox.sh" ]

#!/bin/bash

set -xeo pipefail

trap 'trap " " SIGINT; kill -SIGINT 0; wait;' SIGINT SIGTERM

YOUTUBE_URL="https://www.youtube.com/watch?v=mCCOz1dUz-Q"
SCREEN_WIDTH=1920
SCREEN_HEIGHT=1080

#Run the base entrypoint and wait for 10 seconds
source /etc/warp/entrypoint.sh &
sleep 10

# Create a new Firefox profile for capturing preferences for this
firefox --no-remote --new-instance --createprofile "temp-profile /tmp/firefox-profile"

# Install the OpenH264 plugin for Firefox
sudo mkdir -p /tmp/firefox-profile/gmp-gmpopenh264/1.8.1.1/
unzip /tmp/openh264-1.8.1.1.zip -d /tmp/firefox-profile/gmp-gmpopenh264/1.8.1.1/

# Install additional CA certificates to Firefox (e.g. for development)
mkdir -p ~/ca/
shopt -s nullglob

# Set the Firefox preferences to enable automatic media playing with no user
# interaction and the use of the OpenH264 plugin.
cat <<EOF >> /tmp/firefox-profile/prefs.js
user_pref("browser.startup.homepage_override.mstone", "ignore");
user_pref("media.autoplay.default", 0);
user_pref("media.autoplay.enabled.user-gestures-needed", false);
user_pref("media.navigator.permission.disabled", true);
user_pref("media.gmp-gmpopenh264.abi", "x86_64-gcc3");
user_pref("media.gmp-gmpopenh264.lastUpdate", 1571534329);
user_pref("media.gmp-gmpopenh264.version", "1.8.1.1");
user_pref("doh-rollout.doorhanger-shown", true);
user_pref("dom.allow_scripts_to_close_windows", true);
user_pref("datareporting.policy.firstRunURL", "");
EOF

# Start Firefox browser and point it at the URL we want to capture
#
# NB: The `--width` and `--height` arguments have to be very early in the
# argument list or else only a white screen will result in the capture for some
# reason.

exec firefox \
  -P temp-profile \
  --width ${SCREEN_WIDTH} \
  --height ${SCREEN_HEIGHT} \
  --new-instance \
  --first-startup \
  --foreground \
  --kiosk \
  --ssb "${YOUTUBE_URL}"
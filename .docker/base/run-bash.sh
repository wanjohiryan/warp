#!/bin/bash

set -xeuo pipefail

# Set the directory where the other bash files are located
OTHER_SCRIPTS_DIR="/etc/warp/entrypoint.d/"

# Check if the directory exists
if [ -d "$OTHER_SCRIPTS_DIR" ]; then
  # Loop through all the files in the directory
  for script_file in $OTHER_SCRIPTS_DIR/*.sh; do
    # Check if the file is a bash script and is executable
    if [ -x "$script_file" ] && [ "${script_file: -3}" == ".sh" ]; then
      # Run the script
      echo "Running script $script_file"
      bash "$script_file"
    fi
  done
else
  echo "Directory $OTHER_SCRIPTS_DIR not found or child image's entrypoint script do not exit"
  exit 0
fi

# Run the default command (if provided)
exec "$@"

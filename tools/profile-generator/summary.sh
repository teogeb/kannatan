ls -1 output | grep greyscale | awk -F '-' '{print $1}' | sort | uniq -c

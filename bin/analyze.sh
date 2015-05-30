#!/bin/bash

# ./analyze.sh "assets/test.mp4" 0.4
movie=$1
sensitivity=$2

rm ${movie}.edl
touch ${movie}.edl

ffprobe -loglevel error -show_frames -of compact=p=0 -f lavfi "movie=${movie},select=gt(scene\,${sensitivity})" | sed -r 's/.*pkt_pts_time=([0-9.]{8,})\|.*/\1/' >> ${movie}.edl


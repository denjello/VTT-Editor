#!/bin/bash

# ./analyze.sh "assets/test.mp4" 0.4
# this creates a file with the

movie=$1
sensitivity=$2

mplayer -really-quiet -vo null -ao null -frames 0 -identify "${movie}" | grep 'ID_VIDEO_FPS' | cut -d'=' -f2 > ${movie}.edl

ffprobe -loglevel error -show_frames -of compact=p=0 -f lavfi "movie=${movie},select=gt(scene\,${sensitivity})" | sed -r 's/.*pkt_pts_time=([0-9.]{8,})\|.*/\1/' >> ${movie}.tmp

cat ${movie}.tmp >> ${movie}.edl
rm ${movie}.tmp
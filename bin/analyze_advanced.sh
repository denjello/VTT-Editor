#!/bin/bash

# ./analyze.sh "assets/test.mp4" 0.4

movie=$1
sensitivity=$2

rm ${movie}.edl


fps=$(mplayer -really-quiet -vo null -ao null -frames 0 -identify "${movie}" | grep 'ID_VIDEO_FPS' | cut -d'=' -f2)

#ffprobe -loglevel error -show_frames -of compact=p=0 -f lavfi "movie=${movie},select=gt(scene\,${sensitivity})" | sed -E 's/.*pkt_pts_time=([0-9.]{8,})\|.*/\1/' >> ${movie}.tmp

ffprobe -loglevel error -show_frames -of compact=p=0 -f lavfi "movie=${movie},select=between(scene\,0.01\,0.02)" | sed -E 's/.*tag:lavfi.scene_score=([0-9.]{8,})/\1/' >> ${movie}.tmp

# select=between(scene\,0.01\,0.2)
# ffprobe -loglevel error -show_frames -of compact=p=0 -f lavfi "movie=${movie},select=gt(scene\,${sensitivity})" | sed -E 's/.*lavfi.scene_score=([0-9.]{8,})\|.*/\1/'


# sed -E 's/.*tag:lavfi.scene_score=([0-9.]{8,})/\1/'

cat ${movie}.tmp >> ${movie}.edl
rm ${movie}.tmp

a=0
b=0
while read line
do a=$(($a+1));
b=$(echo "scale=8;($b+$line)" | bc)

echo "$a - $line - $b"

done < "${movie}.edl"
avg=$(echo "scale=8;$b / $a" | bc)
echo "Final line count is: $a lines"
echo "Average is $avg"
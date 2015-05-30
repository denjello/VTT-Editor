#!/usr/bin/env bash

input=$1
output=$2

a=0
while read line
do a=$(($a+1));
#echo "${a}: ${line}"
frame_new=$(expr ${line} \* 25)
echo $frame_new $frame_old >> test.txt
frame_old=${frame_new}
done < "${1}"
echo "Final line count is: $a";

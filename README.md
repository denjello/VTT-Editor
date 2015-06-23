# VTT-Editor

Use VTT files to edit film. Using MELT, ffmpeg and co.

### Requirements

Because of current requirements (and dev environment), it is likely to only work on Linux. Removing this issue is on the roadmap for version 4.

- mltframework
- ffmpeg from GIT (compiled with libfaac & libx264)
- mplayer (cuz its a reliable way to get framerate)
- node.js
- posix shell
- detox 

### Install

https://github.com/mltframework/mlt
https://github.com/ito-suite/node-ito-transcoder/blob/master/bin/build.sh
http://archive.org/~tracey/downloads/ffmpeg-README.txt
http://detox.sourceforge.net/

```
git clone git@github.com:denjello/VTT-Editor.git
cd VTT-Editor
npm install
```

There are several services available, using the following options:

```
Options:
  -i, --inputfile     input file                           [required]
  -o, --outputfile    output file                          [required]
  -v, --verbose       Use -v for extra info, -vv or --verbose for
                      debug                                   [count]
  -s, --sensitivity   sensitivity of scene detection greater than
                      zero and less than one]          [default: 0.5]
  -n, --framemin      Min number of frames per scene     [default: 1]
  -x, --framemax      Max number of frames per scene as a positive
                      whole number, greater than or egual to framemin
  -r, --randomorder   If set to true will randomly slice and dice the
                      file(s) and put them into your output fuile
                                                     [default: false]
  -l, --randomlength  If set to true will choose a length between the
                      framemin and framemax, but always lower than
                      the scenelength                [default: false]
  -b, --batch         If available it will not transcode, but rather 
                      return an edl. (Consumed by mashup_folder.js)
                                                     [default: false]


```


- %file% is a video file (with absolute path in best case)
- %folder% is an absolute path to a folder containing top-level video files
- %outputFile% must be a video name with a file suffix like ".mp4". 
- %accuracy% is a positive value between 0.0001 and 1, where 1 means low accuracy and 0.0001 means high accuracy. A good place to start is 0.01. If you have REALLY boring films and you try 0.9 for example, you will get no results. 
- %framemin% is the shortest number of frames that should be selected 
 - defaults to 1;
- %framemax% is the longest number of frames that should be selected
 - if %framemin% and %framemax% are the same, then each cut will be the same length and randomLength is overridden.
 - defaults to framerate (i.e. one second)
- %randomOrder% if set to true will randomly slice and dice the file(s) and put them into your output fuile.
- %randomLength% if set to true will choose a length between the framemin and framemax, but always lower than the scenelength. 
### edl.js


### edl_dropboring.js

- removes boring parts of films based upon lack of change between frames and retains the sequence.

`
$ node edl_dropboring_norandom.js -f '%file%' -o '%outputFile%' -a '%accuracy' 
`

### mashup_folder.js

- mashups a folder on a constructive file-by.file basis.

`
$ node mashup_folder.js '%folder%' '%accuracy%' '%framemin%' '%framemax%' '%outputFile%'
`


Here is an example that cuts up all of the video files in the folder `~/Videos` with a relatively high accuracy of `0.01` (to scene changes) and a minimum cut length of 5 frames and a maximum cut length of 15 frames:

`
$ node ./bin/mashup_folder.js '~/Videos' '0.01' '5' '15' '/tmp/test.mp4'

`

## Roadmap

[ ] Integrate debug info feedback
[x] Integrate yargs for command line parsing
[x] Detox Filenames to make them safe crossplatform (submodule → detox.js)
[ ] Rewrite detox.js to be node native and not require detox
[x] Determine file framerate (mplayer -identify)
[ ] Drop requirement for mplayer and recycle ffprobe call
[x] Autogenerate scene-cuts based on visual frame difference over time (ffprobe)
[x] Read files line-by-line into node (submodule → liner.js)
[x] Remove boring scenes from any video (edl_dropboring.js)
[x] Randomize non-boring parts of a single film (edl_dropboring_random.js)
[x] Randomly mashup all non-boring scenes of video files in a single folder.
[ ] Add target settings to melt command (height, width, codec etc.)
[ ] Use a VTT file as a source
[ ] Integrate sphinx4 to make word-based subtitles with exact time-code.
[ ] Use an English sentence as a source based on Sphinx4's mapping.
[ ] Integrate openCV to do face-tracking and recenter the output
[ ] Integrate frie0r filter chains
[ ] Realtime video stream
 
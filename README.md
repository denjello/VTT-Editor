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

At the moment there are two main services:


#### MASHUP A FOLDER
```
Example: ./mashup_folder.js -i="/home/user/videos/" -o="test.mp4

Options:
  -i, --inputfolder   input folder with trailing slash                [required]
  -o, --outputfile    output file with mime suffix                    [required]
  -v, --verbose       Use -v=true for extra info                [default: false]
  -y, --system        Use --system=osx if on mac              [default: "linux"]
  -s, --sensitivity   sensitivity of scene detection greater than zero and less
                      than one                                    [default: 0.1]
  -n, --framemin      Min number of frames per scene. Scenes with less than this
                      number of frames will be ignored. It defaults to detected
                      frames per second (fps).                      [default: 1]
  -x, --framemax      Max number of frames per scene as a positive whole number
                      , greater than or equal to framemin. If the scene has more
                      frames than framemax, it will be cut at this number of
                      frames. It defaults to frames per second (fps).
                                                                    [default: 1]
  -r, --randomorder   If set to true will randomly slice and dice the file(s)
                      and put them into your output fuile       [default: false]
  -l, --randomlength  If set to true, it will choose a length between the
                      framemin and framemax, but always lower than the
                      scenelength                               [default: false]
  -b, --batch         If used it will not transcode, but rather return an
                      edl.                                      [default: false]


```


Here is another example that cuts up all of the video files in the folder `~/Videos` with a relatively high accuracy of `0.01` (to scene changes) with a minimum cut length of 5 frames and a maximum cut length of 15 frames, random with verbose output:

`
$ ./mashup_folder.js --inputfolder='~/Videos' --outputfile='test.mp4' --sensitivity=0.01 --framemin=5 --framemax=15 --randomorder=true --randomlength=true --verbose=true
`

#### DROP BORING PARTS OF ONE FILE
```
Example: ./edl_dropboring.js -i="/home/user/videos/demo.mp4" -o="test.mp4"

Options:
  -i, --inputfile     input file                                      [required]
  -o, --outputfile    output file with mime suffix                    [required]
  -v, --verbose       Use -v for extra info                     [default: false]
  -y, --system        Use --system=osx if on mac              [default: "linux"]
  -s, --sensitivity   sensitivity of scene detection greater than zero and less
                      than one]                                   [default: 0.1]
  -n, --framemin      Min number of frames per scene. Scenes with less than this
                      number of frames will be ignored. It defaults to detected
                      frames per second (fps).                      [default: 1]
  -x, --framemax      Max number of frames per scene as a positive whole number
                      , greater than or equal to framemin. If the scene has more
                      frames than framemax, it will be cut at this number of
                      frames. It defaults to frames per second (fps).
                                                                    [default: 1]
  -r, --randomorder   If set to true will randomly slice and dice the file(s)
                      and put them into your output fuile       [default: false]
  -l, --randomlength  If set to true, it will choose a length between the
                      framemin and framemax, but always lower than the
                      scenelength                               [default: false]
  -b, --batch         If available it will not transcode, but rather return an
                      edl.                                      [default: false]
```



## Roadmap

- [x] Integrate yargs for command line parsing
- [x] Detox Filenames to make them safe crossplatform (submodule → detox.js)
- [ ] Rewrite detox.js to be node native and not require detox
- [x] Determine file framerate (mplayer -identify)
- [ ] Drop requirement for mplayer and recycle ffprobe call
- [ ] Drop `file` dependency 
- [x] Autogenerate scene-cuts based on visual frame difference over time (ffprobe)
- [x] Read files line-by-line into node (submodule → liner.js)
- [x] Remove boring scenes from any video (edl_dropboring.js)
- [x] Randomize non-boring parts of a single film (edl_dropboring_random.js)
- [x] Randomly mashup all non-boring scenes of video files in a single folder.
- [ ] Add iteration count to make longer videos
- [ ] Add target settings to melt command (height, width, codec etc.)
- [ ] Use a VTT file as a source
- [ ] Use a 
- [ ] Integrate sphinx4 to make word-based subtitles with exact time-code.
- [ ] Use an English sentence as a source based on Sphinx4's mapping.
- [ ] Integrate openCV to do face-tracking and recenter the output
- [ ] Integrate frie0r filter chains
- [ ] Realtime video stream
 
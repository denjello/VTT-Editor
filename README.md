# VTT-Editor

Use VTT files to edit film. Using MELT, ffmpeg and co.

At the moment there are several progs available.

`edl.js`

- cuts up a film randomly at minimum change, call it like this:

`
$ node ./bin/edl.js video.mp4 '0.001'
`

`mashup_folder.js`

- mashups up a folder on a recursively constructive node-by-node basis.

`
$ node ./bin/mashup_folder.js "~/Videos"
`
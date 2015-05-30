var fs = require('fs');
var cp = require('child_process');
var liner = require('./liner');
var source = fs.createReadStream('./liner.edl');
var melt="";
var line="";
source.pipe(liner);
liner.on('readable', function () {
    while (line = liner.read()) {
        // do something with line
        melt = melt+" "+line;
    }
    if (liner._lastLineData == null) {
        //console.log(melt)

        // todo: make .fifo safe and sane by NOT pumping the post from userland right into the script.
        cp.exec('melt '+ melt +' -consumer avformat:assets/test.mp4');

    }
})
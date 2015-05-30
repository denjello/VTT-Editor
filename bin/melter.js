var liner = require('./liner');
var melt="";
var inPoint=null;
var outPoint=null;
var edls=new Array();
var x=0;
var edl_file=file+'.edl'
var source = fs.createReadStream(edl_file);

source.pipe(liner);
liner.on('readable', function () {

    console.log("readable");
    var line;
    while (line = liner.read()) {
        // do something with line

        if (inPoint == null) {
            inPoint = parseInt(line, 10) * Global.framerate;
        }
        outPoint = parseInt(line, 10) * Global.framerate;
        if (inPoint != outPoint) {
            edls[x](file + " in=" + inPoint + " out=" + outPoint);
        }
        x = x + 1
        inPoint = parseInt(line, 10) * Global.framerate;

    }
    if (liner._lastLineData == null) {
        console.log("lastline");
        for (var i = edls.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = edls[i];
            edls[i] = edls[j];
            edls[j] = temp;
        }
        console.log(edls)

        for (var i = edls.length - 1; i > 0; i--) {
            melt = melt + " " + edls[i];
            console.log("edls", edls)
        }
        cp.exec('melt ' + melt + ' -consumer avformat:assets/vegetables_random.mp4', function (err, stdout) {
            return stdout;
        })
    }
}
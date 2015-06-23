var fs = require('fs');
var cp = require('child_process');
var sys = require('sys');
var async = require('async');
var liner = require('./bin/liner');
var file = process.argv[2];
var accuracy = process.argv[3];
var Global = {};


async.waterfall([
    function(cb){
        // break it into breaks
        cp.exec("./analyze.sh "+file+" "+accuracy,function(){
            cb(null);
        });
    },
    function (cb) {
        // figure out the framerate
        console.log("2",file);

            cp.exec("mplayer -really-quiet -vo null -ao null -frames 0 -identify " + file + " | grep 'ID_VIDEO_FPS' | cut -d'=' -f2", function (err, stdout) {
                console.log("framerate: "+stdout);
                Global.framerate=parseInt(stdout,10);
                var melt="";
                var inPoint=null;
                var outPoint=null;
                edls=new Array();
                var x=0;
                var edl_file=file+'.edl';
                console.log(edl_file);
                var source = fs.createReadStream(edl_file);
                source.pipe(liner);
                liner.on('readable', function () {
                    var line;
                    while (line = liner.read()) {
                        // do something with line
                        console.log(line);
                        if (inPoint==null) {
                            inPoint=parseInt(line,10)*Global.framerate;
                        }
                        outPoint=parseInt(line,10)*Global.framerate;
                        if (inPoint!=outPoint) {
                            edls.push(file+" in="+inPoint+" out="+outPoint)
                        }
                        inPoint=parseInt(line,10)*Global.framerate;
                    }


                    if (liner._lastLineData == null) {
                        console.log("lastline");
                        for (var i = edls.length - 1; i > 0; i--) {
                            var j = Math.floor(Math.random() * (i + 1));
                            var temp = edls[i];
                            edls[i] = edls[j];
                            edls[j] = temp;
                        }

                        for (var i = edls.length - 1; i > 0; i--) {
                            melt = melt +" "+ edls[i];
                        }
                        console.log(edls)

                        cp.exec('melt '+ melt +' -consumer avformat:/tmp/tmp.mp4',function(err,stdout){
                            cb(null)

                        });
                    }

                })

            })
    }]);






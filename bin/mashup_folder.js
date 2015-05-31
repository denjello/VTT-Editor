make = function(file,accuracy){

    var fs = require('fs');
    var cp = require('child_process');
    var sys = require('sys');
    var async = require('async');
    var liner = require('./liner');
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
}






var fs = require('fs');
var cp = require('child_process');

var path = process.argv[2];
var exec = require('sync-exec');
var videoListing = new Array();

fs.readdir(path,function(err,files){
    for (var i = files.length - 1; i > -1; i--) {
        var activeFile=files[i];
        var activePath=path + "/" + activeFile;
        var thing  = exec("file -b -k --mime-type  '" + activePath + "' | cut -d'/' -f1")
        if (thing.stdout == "video\n") {
            //console.log(activePath);
            var detox = exec("detox '" + activePath + "' -v | grep ' -> ' | cut -d'>' -f2");
            if (detox.stdout) {
                activePath= path + "/" +detox.stdout;
            }
            videoListing.push(activePath);
        }

        /* DETOX=$(detox "${fullfile}" -v | grep " -> " | cut -d'>' -f2)
         if test ${DETOX}; then
         echo "Original Filename DETOXIFIED"
         ACTIVEFILE=${DETOX}
         */

    }
    console.log(videoListing)
    for (var i = videoListing.length - 1; i > -1; i--) {
        console.log("recombining " + videoListing[i]+ " with previous works")
        exec('melt /tmp/tmp.mp4 '+ videoListing[i]+' -consumer avformat:/tmp/tmp_tmp.mp4')
        console.log("tracking all works")
        //exec("node edl.js '/tmp/tmp_tmp.mp4' '0.01'")
        exec("node edl_dropboring.js '/tmp/tmp_tmp.mp4' '0.01'")
        console.log(videoListing[i]+ "finished processing")
    }
});

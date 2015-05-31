var fs = require('fs');
var cp = require('child_process');

var path = process.argv[2];
var exec = require('sync-exec');
var videoListing = new Array();

fs.readdir(path,function(err,files){
    for (var i = files.length - 1; i > 0; i--) {
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


});

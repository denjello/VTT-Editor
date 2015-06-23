#!/usr/bin/env node

// this is a thin wrapper for the bash command "file" and the CLI application "detox".
// it makes filenames safe for use (and optionally checks filetype)
// it returns an array of file URIs as "detox._fileListing"

// USAGE
// detox.folder("~/Videos", "video")
// detox.file("~/Videos/thing.jpg", "image")

var fs = require('fs');
var exec = require('sync-exec');
var detox = new Array();

var DETOX = function(file) {
    var _detox = exec("detox '" + file + "' -v | grep ' -> ' | cut -d'>' -f2",1000);
    if (_detox.stderr) {
        console.log("err:"+_detox.stderr);
    }
    if (_detox.stdout) {
        file = _detox.stdout;
        console.log(file);
        return file;
    } else {
        console.log("not detox'd: "+file);
        return file;
    }
};

detox.folder = function (path,filetype) {
    "use strict";
    var fileListing = new Array();
    fs.readdir(path,function(err,files){
        for (var i = files.length - 1; i > 0; i--) {
            var activeFile=files[i];
            var activePath=path + activeFile;
            if (filetype) {
                var thing  = exec("file -b -k --mime-type  '" + activePath + "' | cut -d'/' -f1");
                if (thing.stdout == filetype+"\n") {
                    fileListing.push(DETOX(activePath));
                }
            } else {
                fileListing.push(DETOX(activePath));
            }
        }
        return fileListing;
    });
};
detox.file = function(file,filetype) {
    "use strict";
    if (filetype) {
        var thing  = exec("file -b -k --mime-type  '" + file + "' | cut -d'/' -f1");
        if (thing.stdout == filetype+"\n") {
            return DETOX(file);
        }
    } else {
        return DETOX(file);
    }
};

module.exports = detox;


#!/usr/bin/env node

var argv = require('yargs')
        .strict()
        .wrap(null)
        .usage('Usage: $0 \n -i [inputfolder] \n -o [outputfile] \n -s [sensitivity (0.0001-1)] \n -n [1+] \n -x [1+ && >= n] \n -o [randomorder (true || false)] \n -l [randomlength (true || false) ')
        .default({s:0.5,r:false,l:false,b:false})

        .demand('inputfolder')
        .alias('i', 'inputfolder')
        .describe('i','input folder with trailing slash')
        .nargs('i', 1)

        .demand('outputfile')
        .alias('o', 'outputfile')
        .describe('o','output file with mime suffix')
        .nargs('o', 1)

        .count('verbose')
        .alias('v', 'verbose')
        .describe('v','Use -v for extra info, -vv or --verbose for debug ')

        .alias('s', 'sensitivity')
        .nargs('s', 1)
        .describe('s','sensitivity of scene detection greater than zero and less than one]')

        .alias('n', 'framemin')
        .nargs('n', 1)
        .describe('n','Min number of frames per scene. Scenes with less than this number of frames will be ignored. It defaults to detected frames per second (fps).')

        .alias('x', 'framemax')
        .nargs('x', 1)
        .describe('x','Max number of frames per scene as a positive whole number, greater than or equal to framemin. If the scene has more frames than framemax, it will be cut at this number of frames. It defaults to frames per second (fps).')

        .alias('r', 'randomorder')
        .nargs('r', 1)
        .describe('r','If set to true will randomly slice and dice the file(s) and put them into your output fuile')

        .alias('l', 'randomlength')
        .nargs('l', 1)
        .describe('l','If set to true, it will choose a length between the framemin and framemax, but always lower than the scenelength')

        .alias('b', 'batch')
        .nargs('b', 1)
        .describe('b','If available it will not transcode, but rather return an edl.')

        .example("$0 -i /home/user/Videos/ -o out.mp4 -s 0.03 -n 25 -x 25 -rv","(This uses in.mp4 as the input, creates out.mp4 as its output with a moderately high sensitivity of 0.03, a steady scene length of 25 frames and randomizes the scenes in the output. This will also give some verbose logging.)")

        .epilog('Denjell ©2015 - GPLv3')
        .argv,

    fs = require('fs'),
    exec= require('sync-exec'),
    async = require('async'),
    detox = require('./bin/detox'),
    path = argv.i,
    outputfile = argv.o,
    sensitivity = argv.s || 0.5,
    framemin = argv.n || 1,
    framemax = argv.x,
    randomOrder = argv.r,
    randomLength = argv.l,
    batch = argv.b,
    edlFinal = new Array(),
    Global = {};
    Global.fileListing= new Array();
    Global.melt=new Array();
    Global.command="";

VERBOSE_LEVEL = argv.verbose;

function WARN()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments); }


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// SANITY CHECK!!!
if (!isNumber(framemin)) framemin=1;
if(framemax && isNumber(framemin) && framemin > framemax) {
    framemin=framemax;
}
if (!isNumber(sensitivity) || sensitivity <= 0 || sensitivity >= 1) {
    throw "Sensitivity value is wrong."
}

var videoListing = new Array();

// construct the command line
var options= " -b "; // turn off individual melt render
if (framemin) options=options+" -n "+framemin;
if (framemax) options=options+" -x "+framemax;
if (sensitivity) options=options+" -s "+sensitivity;
if (randomOrder && randomLength) {
    options=options+" -rlv "
}
if (randomOrder && !randomLength) {
    options=options+" -rv "
}
if (!randomOrder && randomLength) {
    options=options+" -lv "
}


INFO("OPTIONS:" + options);

async.waterfall([
    function(cb) {
        // first step: get the video files in the folder
        fs.readdir(path,function(err,files) {
            for (var i = 0; i <= files.length; i++) {
                var activeFile = files[i];
                var activePath = path + activeFile;
                var thing=detox.file(activePath, "video");
                if(thing) {
                    Global.fileListing.push(thing);
                }
            }
            cb(null);
        });
    },
    function(cb) {
        // second step: analyze each file
        for (var i = 0; i < Global.fileListing.length; i++) {
            this.file = Global.fileListing[i];
            if (this.file) {
                exec("./edl_dropboring.js -i '" +  Global.fileListing[i] + "' -o '" + outputfile + i + "' " + options);
                INFO("./edl_dropboring.js -i '" +  Global.fileListing[i] + "' -o '" + outputfile + i + "' " + options)
                this.melt = fs.readFileSync(outputfile+i+'.edl').toString().split('\n');
                for(var x=0;x < this.melt.length; x++) {
                    if (this.melt[x].length != 0) {
                        Global.melt.push(this.melt[x])
                    }
                }
            }
        }
        INFO("GLOBAL: ",Global.melt)

        if (randomOrder == true) {
            for (var i = 0; i < Global.melt.length; i++) {
                console.log(i);
                var j = Math.floor(Math.random() * (i + 1));
                var temp = Global.melt[i];
                edlFinal[i] = edlFinal[j];
                edlFinal[j] = temp;
            }

            for (var i = 0; i < edlFinal.length; i++) {
                Global.command = Global.command + " " + edlFinal[i];
            }
        } else {
            for (var i = 0; i <  Global.melt.length; i++) {
                Global.command = Global.command + " " +  Global.melt[i];
            }
        }
        INFO("edlFinal: " +edlFinal);
        INFO("melt: " + Global.command);
        exec('melt ' + Global.command + ' -consumer avformat:' + outputfile);
    }
]);


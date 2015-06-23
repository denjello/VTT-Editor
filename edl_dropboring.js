#!/usr/bin/env node

var argv = require('yargs')
        .strict()
        .wrap(null)
        .usage('Usage: $0 \n -i [inputfile] \n -o [outputfile] \n -s [sensitivity (0.0001-1)] \n -n [1+] \n -x [1+ && >= n] \n -o [randomorder (true || false)] \n -l [randomlength (true || false) ')
        .default({s:0.5,r:false,l:false,b:false})

        .demand('inputfile')
        .alias('i', 'inputfile')
        .describe('i','input file')
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

        .example("$0 -i in.mp4 -o out.mp4 -s 0.03 -n 25 -x 25 -rv ","(This uses in.mp4 as the input, creates out.mp4 as its output with a moderately high sensitivity of 0.03, a steady scene length of 25 frames and randomizes the scenes in the output. This will also give some verbose logging.)")

        .epilog('Denjell ©2015 - GPLv3')
        .showHelpOnFail(true)
        .argv,

    fs = require('fs'),
    cp = require('child_process'),
    async = require('async'),
    liner = require('./bin/liner'),
    detox = require('./bin/detox'),
    file = argv.i,
    outputfile = argv.o,
    sensitivity = argv.s || 0.5,
    framemin = argv.n || 1,
    framemax = argv.x,
    randomOrder =argv.r,
    randomLength = argv.l ,
    batch = argv.b || false,
    outputEdl,
    Global = {};


    outputEdl = fs.createWriteStream(outputfile+'.edl');

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


// start after we have opened our output edl file.
outputEdl.on('open', function() {
    "use strict";
    async.waterfall([
        function(cb){
            Global.filelisting = detox.file(file,"video");
            //if (Global.filelisting == undefined) throw "file not found: " + file;
            cb(null)
        },
        function(cb){
            // get cut points according to sensitivity
            cp.exec("./bin/./analyze.sh '"+Global.filelisting+"' "+sensitivity, function(){
                cb(null);
            });
        },
        function (cb) {
            var melt="";
            var edls=new Array();
            var inOUT=0;
            var lineCOUNT=0;
            var line;
            var mark;
            var edl_file=Global.filelisting+'.edl';
            INFO(edl_file);

            var source = fs.createReadStream(edl_file);
            source.pipe(liner);
            INFO(liner._lineCount);

            liner.on('readable', function () {
                while (line = liner.read()) {
                    lineCOUNT++;
                    if (lineCOUNT == 1) {
                        // the first line is the fps
                        Global.framerate=line;
                        INFO("FPS: "+Global.framerate);
                        if (framemax == undefined) framemax=Global.framerate;
                        if (framemin == undefined) framemin=Global.framerate;
                    } else {
                        inOUT++; // whether we are at an inframe or an outframe
                        mark=Math.round(line*Global.framerate); // this framenumber
                        INFO(mark);
                        if (inOUT >=2 || lineCOUNT == 2) { // back at an inpoint
                            //inpoint is always correct!
                            inOUT=0;
                            Global.in = mark;
                        } else {
                            //sanity check
                            if (mark > Global.in) {
                                this.distance=mark - Global.in; // the length of the scene
                                if (randomLength==true) {
                                    var rand= Math.round(Math.random() * (framemax - framemin) + framemin);

                                    if (this.distance >= rand) {
                                        INFO("this.distance >= rand: " + rand);

                                        this.mark=Global.in+rand;
                                        this.line=file + " in=" + Global.in + " out=" + this.mark;
                                    } else {
                                        this.line=false;
                                    }
                                    // get the new out-mark
                                   // && framemin < this.distance
                                } else {
                                    if (this.distance >= framemax && this.distance >= framemin) {
                                        mark=Global.in+framemax;
                                        this.line=file + " in=" + Global.in + " out=" + mark;
                                    } else {
                                        this.line=false;
                                    }
                                }
                                if (this.line) {
                                    INFO(lineCOUNT + ':' + this.line);
                                    edls.push(this.line);
                                    outputEdl.write(this.line+'\n');
                                }
                            }
                        }
                    }
                }

                if (liner._lastLineData == null) {
                    // we have arrived at the last line.
                    if (randomOrder === true) {
                        for (var i = edls.length - 1; i > 0; i--) {
                            var j = Math.floor(Math.random() * (i + 1));
                            var temp = edls[i];
                            edls[i] = edls[j];
                            edls[j] = temp;
                        }

                        for (var i = edls.length - 1; i > 0; i--) {
                            melt = melt + " " + edls[i];
                        }
                    } else {
                        for (var i = edls.length - 1; i > 0; i--) {
                            melt = melt + " " + edls[i];
                        }
                    }

                    INFO(edls);
                    if(batch==false){
                        cp.exec('melt ' + melt + ' -consumer avformat:' + outputfile, function (err, stdout) {
                            cb(null)
                        });
                    } else {
                        cb(null)
                    }
                }
            })
        }]);
});

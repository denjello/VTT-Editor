#!/usr/bin/env node

var argv = require('yargs')
        .strict()
        .default({
            s:0.1,
            r:false,
            l:false,
            b:false,
            y:'linux',
            v:false,
            n:1,
            x:1
        })

        .demand('inputfolder')
        .alias('i', 'inputfolder')
        .describe('i','input folder with trailing slash')
        .nargs('i', 1)

        .demand('outputfile')
        .alias('o', 'outputfile')
        .describe('o','output file with mime suffix')
        .nargs('o', 1)


        .alias('t', 'interactive')
        .nargs('t', 1)
        .describe('t','Use -t=true to ')


        .alias('v', 'verbose')
        .nargs('v', 1)
        .describe('v','Use -v=true for extra info')

        .alias('y', 'system')
        .nargs('y', 1)
        .describe('y','Use --system=osx if on mac')

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

        .usage('Example: ./$0 -i="/home/user/videos/" -o="test.mp4"')

        .epilog('Denjell [c]2015 - GPLv3')
        .argv,
    readlineSync = require('readline-sync'),
    fs = require('fs'),
    exec= require('sync-exec'),
    async = require('async'),
    detox = require('./bin/detox'),
    _path = require('path'),
    path = argv.i,
    outputfile = argv.o,
    sensitivity = argv.s || 0.5,
    framemin = argv.n || 1,
    framemax = argv.x,
    system = argv.y,
    randomOrder = argv.r,
    randomLength = argv.l,
    batch = argv.b,
    edlFinal = new Array(),
    Global = new Array();
    Global.fileListing= new Array();
    Global.melt=new Array();
    Global.command="";


function INFO()  { argv.v && console.log.apply(console, arguments); }



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

// construct the command line
var options= ""; // turn off individual melt render
if (framemin) options=options+"-n="+framemin;
if (framemax) options=options+" -x="+framemax;
if (sensitivity) options=options+" -s="+sensitivity;
if (system) options=options+" -y="+system;
if (randomOrder && randomLength) {
    options=options+" -r=true -l=true -v=true -b=true "
}
else if (randomOrder && !randomLength) {
    options=options+" -r=true -v=true -b=true "
}
else if (!randomOrder && randomLength) {
    options=options+" -l=true -v=true -b=true "
} else {
    options=options+" -v=true -b=true "
}



INFO("OPTIONS:" + options);

async.waterfall([
    function(cb) {
        // first step: get the video files in the folder
        fs.readdir(path,function(err,files) {
            for (var i = 0; i <= files.length; i++) {
                var activeFile = files[i];
                if (activeFile) {
                    var activePath = _path.join(path, activeFile);
                    var thing=detox.file(activePath, "video", system);
                    if(thing) {
                        Global.fileListing.push(thing);
                    }
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
                exec("./edl_dropboring.js -i='" +  Global.fileListing[i] + "' -o='/tmp/VTT-" + i + "' " + options);
                INFO("./edl_dropboring.js -i='" +  Global.fileListing[i] + "' -o='/tmp/VTT-" + i + "' " + options);
                this.melt = fs.readFileSync('/tmp/VTT-'+i+'.edl').toString().split('\n');
                for(var x=0;x < this.melt.length; x++) {
                    if (this.melt[x].length != 0) {
                        Global.melt.push(this.melt[x])
                    }
                }
            }
        }
        INFO("GLOBAL: ",Global.melt);

        if (randomOrder) {
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
        cb(null);
    }
]);


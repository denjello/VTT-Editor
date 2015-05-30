controlbar.addEventListener('mousemove',function(e) {
    // first we convert from mouse to time position ..
    var p = (e.pageX - controlbar.offsetLeft) * video.duration / 480;

    // ..then we find the matching cue..
    var c = video.textTracks[0].cues;
    for (var i=0; i<c.length; i++) {
        if(c[i].startTime <= p && c[i].endTime > p) {
            break;
        };
    }

    // ..next we unravel the JPG url and fragment query..
    var url =c[i].text.split('#')[0];
    var xywh = c[i].text.substr(c[i].text.indexOf("=")+1).split(',');

    // ..and last we style the thumbnail overlay
    thumbnail.style.backgroundImage = 'url('+c[i].text.split('#')[0]+')';
    thumbnail.style.backgroundPosition = '-'+xywh[0]+'px -'+xywh[1]+'px';
    thumbnail.style.left = e.pageX - xywh[2]/2+'px';
    thumbnail.style.top = controlbar.offsetTop - xywh[3]+8+'px';
    thumbnail.style.width = xywh[2]+'px';
    thumbnail.style.height = xywh[3]+'px';
});


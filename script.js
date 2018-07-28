/**
 * Tumblr Boombox Script
 * github @robinpx
 **/
var boombox = function() {

var audioFiles = [];
var postURLs = [];

var linkOfWindow = window.location.href;
var indexOfUsername = linkOfWindow.indexOf("?username=");
var indexOfTag = linkOfWindow.indexOf("?tag=");
var tagged = "";
if (indexOfTag > 0) {
    tagged = linkOfWindow.substring(indexOfTag+5, indexOfUsername);
}
var username = linkOfWindow.substring(indexOfUsername+10, linkOfWindow.length);

var count = -1;
var postsStart = 0;
var postsEnd = 30;
var postLength = 33;
var postsTotal = 33;
var numOfSongs = 0;
var index = 0;

var repeatBool = false;
var shuffleBool = false;

var current = "";

var timer;

var trackCache = "";

/**
 * Gets first batch of tracks if there are any.
 **/
$.getScript("//" + username + ".tumblr.com/api/read/json?type=audio&tagged=" + tagged, function() {
    postsTotal = tumblr_api_read["posts-total"];
    postsStart = tumblr_api_read["posts-start"];

    console.log(postsTotal + " is the total amount of audio posts on " + username + ".tumblr.com.");
    if (postsTotal === 0 || isNaN(postsTotal)) {
        $("#loadmore").remove();
        return;
    }
    $("#currentUser").append("<a href='https://" + username + ".tumblr.com'>" + username + "</a>");
    var link = "https://" + username + ".tumblr.com/api/read/json?start=" + postsStart + "&num=" + postsTotal + "&type=audio&tagged=" + tagged;
    retrieveAPI(link);
});

/**
 * Retrieves audio posts and binds click method.
 * Add load more button if there are more tracks.
 **/
function retrieveAPI(url) {
    $.getScript(url, function() {
      var i = 0;
      while (bool && i < 30) {
            try {
                var post = tumblr_api_read.posts[i];
		postLength = tumblr_api_read.posts.length;
                var audioEmbed = post["audio-embed"];
                var track = post["id3-title"];
                var artist = post["id3-artist"];
            	var postURL = decodeURIComponent(post["url"]);
                var audiofile = audioEmbed.substring(audioEmbed.indexOf("src") + 5, audioEmbed.indexOf('" frameborder'));
                var fileType = getFileType(audiofile);
                if (fileType === 0) {
                    processTumblrAudio(audiofile);
                    appendTracks(track, artist, "tumblr");
                    postURLs[count] = postURL;
                }
            	else if (fileType === 1) {
            	    count++;
            	    audioFiles[count] = decodeURIComponent(audiofile);
            	    appendTracks(track, artist, "tumblr");
		    postURLs[count] = postURL;
            	}
                else if(fileType === 2) {
                    processSCAudio(audiofile);
                    appendTracks(track, artist, "soundcloud");
                    postURLs[count] = postURL;
                }
                else if (fileType === 3) {
		    count++;
	       	    processBCAudio(audiofile, count);
		    appendTracks(track, artist, "bandcamp");
		    audioFiles[count] = "https://robinpx.github.io/audio/emptysong.mp3";
		    postURLs[count] = postURL;
		    bool = true;
                }
		else if (fileType === 4) {
		    count++;
		    processSPAudio(audiofile, count);
		    appendTracks(track, artist, "spotify");
		    audioFiles[count] = "https://robinpx.github.io/audio/emptysong.mp3";
		    postURLs[count] = postURL;
		    bool = true;

		}
                else {
                    postsEnd++;
                }
            }
            catch(e) {
                console.log(e);
                i++;
            }
		i++;
        }
        console.log(count + " files processed.");
    }).done(function() {
	numOfSongs = audioFiles.length;
	
	if (postsEnd <= postsTotal && (postLength + postsEnd) > 50) {
	   $("#tracks").append("<div id='loadmore' class='lin' onClick='boombox.loadMore()'>Load more</div>");
	}
	 
	console.log("Setting cache and filter...");
	$("#tracks").prepend(trackCache);
	trackCache = $("#tracks .tune").detach();
	filter();

    });
}

/**
 * Checks if audio file is from Tumblr
 * Returns a number -- 0 = tumblr, 1 = mp3, 2 = soundcloud, 3 = bandcamp
 **/
function getFileType(file) {
    if (file.indexOf(username) > 0) {
        return 0;
    }
    else if (file.indexOf("mp3") > 0) {
        return 1;
    }
    else if(file.indexOf("soundcloud") > 0) {
        return 2;
    }
    else if(file.indexOf("bandcamp") > 0) {
        return 3;
    }
    else if(file.indexOf("spotify") > 0) {
        return 4;
    }
    else {
        return false;
    }
}

function appendTracks(track, artist, type) {
    if (track === undefined) {
        track = "Unknown";
    }
    if (artist === undefined) {
        artist = "Unknown";
    }
    $("#tracks").append("<div class='" + type + " lin song-" + count + " tune'><div class='track'><svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='1.4em' height='1.2em' viewBox='0 0 30 32'><g id='icomoon-ignore'></g><path d='M13.652 5.265l-7.696 6.134h-5.955v4.748l-0.003 0.003 0.003 0.003v4.698h5.987l7.664 6.015v-6.015h0.001v-9.451h-0.001z' fill='#000000'></path><path d='M16.105 10.726c1.142 1.522 1.746 3.336 1.746 5.246 0 1.95-0.627 3.795-1.813 5.335l0.832 0.641c1.329-1.726 2.032-3.792 2.032-5.976 0-2.139-0.677-4.171-1.957-5.877l-0.84 0.631z' fill='#000000'></path><path d='M20.336 6.919l-0.809 0.669c1.973 2.389 3.059 5.416 3.059 8.521 0 3.069-1.009 5.956-2.919 8.348l0.82 0.655c2.060-2.58 3.148-5.693 3.148-9.003-0-3.349-1.172-6.613-3.3-9.19z' fill='#000000'></path><path d='M23.606 3.51l-0.789 0.694c2.896 3.289 4.492 7.518 4.492 11.909 0 4.302-1.539 8.467-4.335 11.727l0.798 0.683c2.957-3.45 4.587-7.858 4.587-12.41 0-4.647-1.688-9.123-4.753-12.603z' fill='#000000'></path></svg>" + track + "</div><div class='artist'>" + artist + "</div></div>");
}

/**
 * Decodes URL and/or retrieves file
 **/
function processTumblrAudio(file) {
    file = file.substring(file.indexOf("audio_file") + 11, file.length);
    count++;
    audioFiles[count] = decodeURIComponent(file);
}

function processSCAudio(file) {
    count++;
    file = decodeURIComponent(file);
    file = file.substring(file.indexOf("url") + 4, file.indexOf("&amp"));
    audioFiles[count] = file + "/stream?client_id=N2eHz8D7GtXSl6fTtcGHdSJiS74xqOUI";
    // client id @ wordpress
}

function processBCAudio(audioUrl, count) {
    var url = audioUrl.substring(0, audioUrl.indexOf('" allowtransparency'));
    var file = "";

    $.getJSON("https://whateverorigin.herokuapp.com/get?url=" + encodeURIComponent(url) + "&callback=?", function(data){
	var contentstr = data.contents;

	var i = contentstr.indexOf("var playerdata");
	var i2 = contentstr.indexOf("var parentpage");
	contentstr = contentstr.substring(i, i2);
	var mp3str = '"file":{"mp3-128":"';
	var i3 = contentstr.indexOf(mp3str) + mp3str.length;
	var i4 = i3 + contentstr.substring(i3).indexOf('"}');
	contentstr = contentstr.substring(i3, i4);

	file = contentstr;

    }).done(function() {
	audioFiles[count] = file;
    });
}

function processSPAudio(audioUrl, count) {
     var url = audioUrl;
     var file = "";

     $.getJSON("https://whatever-origin.herokuapp.com/get?url=" + encodeURIComponent(url) + "&callback=?", function(data){
	var contentstr = data.contents;

	var i = contentstr.indexOf('script id="resource"');
	var i2 = contentstr.indexOf('"track_number"');
	contentstr = contentstr.substring(i, i2);

	var mp3str = '"preview_url":"';
	var i3 = contentstr.indexOf(mp3str) + mp3str.length;
	var i4 = i3 + contentstr.substring(i3).indexOf('",');
	contentstr = contentstr.substring(i3, i4).replace(/\\/g, "");

	file = contentstr;

     }).done(function() {
	audioFiles[count] = file;
    });
}

/**
 * Sets up the boombox and adds
 * click method to play and pause buttons.
 **/
function init() {
    numOfSongs = audioFiles.length;
    index = 0;
    current = "song-" + index;
    setPlayer();
    $("." + current).addClass("highlight");
    setBoombox();
    $("#pause").click(function() {
        document.getElementById(current).pause();
        $("#play").show();
        $(this).hide();
    });

    $("#play").click(function() {
        $("audio").unbind("ended", endedSong);
        $("audio").bind("ended", endedSong);
        checkError();
        /* bind and check errors for first song */
        document.getElementById(current).ontimeupdate = function() { updateProgress(); }
        document.getElementById(current).play();
        $("#pause").show();
        $(this).hide();
    });
}

/**
 * setBoombox sets up the welcome screen, currently playing
 * section if tracks are not null, or no tracks screen if
 * there are no tracks.
 **/
function setBoombox() {
    if (indexOfUsername === -1) {
        $("#tracks").append("<div class='lin'>Welcome! Please enter a Tumblr username to begin listening.</div>");
        return;
    }
    else if ($(".highlight .track").html() !== null) {
        $("#defined").fadeIn();
        changeCurrentSong();
    }
    else if (tagged.length > 0) {
        $("#tracks").append("<div class='lin'>It's quiet over here in <a href='https://" + username + ".tumblr.com/tagged/" + tagged + "'>#" + tagged.replace(/\+/g," ") + "</a> on Tumblr user <a href='https://" + username + ".tumblr.com'>" + username + "</a>'s account.</div>");
        return;
    }
   else {
        $("#tracks").append("<div class='lin'>Oh... there aren't any tunes on Tumblr user <a href='https://" + username + ".tumblr.com'>" + username + "</a>'s account.</div>");
	return;
   }
}

function setSongClass(direction) {
	if (direction === "next") {
		if ($("#tracks").find(".tune").length - $("." + current).index() <= 1) {
			current = $(".tune").first().attr("class");
		}
		else {
			current = $("." + current).next().attr("class");
		}
	}
	else if (direction === "prev") {
		if ($("." + current).prev().length === 0) {
			current = $(".tune").last().attr("class");
		}
		else {
			current = $("." + current).prev().attr("class");
		}
	}
	current = current.substring(current.indexOf("song-"), current.indexOf(" tune"));
	index = current.substring(current.indexOf("song-")+5, current.length);

}

function nextSong() {
     exitSong();
     setSongClass("next");
     enterSong();
}

function prevSong() {
    exitSong();
		setSongClass("prev");
    enterSong();
}

function repeatSong() {
    document.getElementById(current).currentTime = 0;
    document.getElementById(current).pause();
    console.log("Repeating....");
    document.getElementById(current).ontimeupdate = function() { updateProgress(); }
    document.getElementById(current).play();
 }

function shuffleSong() {
    exitSong();
    console.log("Shuffling....");
    index = Math.floor(Math.random() * ($(".tune").length - 1));
    current = "song-" + index;
    enterSong();
}

function pressedSong() {
    var className = $(this).attr("class");
    var songIndex = className.indexOf("song-");
    var songNum = className.substring(songIndex+5, className.length);
    songNum = parseInt(songNum);
    exitSong();
    index = songNum;
    current = "song-" + index;
    enterSong();
}

function endedSong(){
    if (repeatBool === true) {
        repeatSong();
    }
    else if (shuffleBool === true) {
        shuffleSong();
    }
    else {
        nextSong();
    }
}

/**
 * Resets the current song and pauses it.
 **/
function exitSong() {
    window.clearTimeout(timer);
    console.log("Timeout function cleared.");
    document.getElementById(current).currentTime = 0;
    document.getElementById(current).pause();
    $("." + current).removeClass("highlight");
    $("#play").show();
    $("#pause").hide();
}

/**
 * Sets up the new current song and plays it.
 **/
function enterSong() {
    setPlayer();
    document.getElementById(current).ontimeupdate = function() { updateProgress(); }
    document.getElementById(current).play();
    $("." + current).addClass("highlight");
    $("#pause").show();
    $("#play").hide();
    checkError();
    changeCurrentSong();
}

/**
 * Resets player for current song.
 **/
function setPlayer() {
    document.getElementById("currenttime").innerHTML = "00:00";
    document.getElementById("currentdura").innerHTML = "00:00";
    $("#progress").css({width : "0px"});
    $("#loading").css({ width : "0px" });
    $("audio").attr("id", current);
    $("audio").attr("src", audioFiles[index]);
    $("audio").unbind("ended", endedSong);
    $("audio").bind("ended", endedSong);
}

function changeCurrentSong() {
    var currentTrack = $(".highlight .track").html();
    var currentArtist = $(".highlight .artist").html();
    $("#currentTrack").empty().append(currentTrack);
    if (currentArtist !== "Unknown") {
      $("#by").show();
      $("#currentArtist").empty().append(currentArtist);
    }
    else {
      $("#by").hide();
      $("#currentArtist").empty();
    }
    $("#currentPost").empty().append("<a href='" + postURLs[index] + "' target='_blank'>Go to post</a>");
}

/**
 * Checks if audio source loads after 15 seconds.
 * Goes to next song if error.
 **/
function checkError() {
    $("." + current).removeClass("error");
    timer = window.setTimeout(function() {
        var time = document.getElementById(current).currentTime;
        var dura = document.getElementById(current).duration;
        if (time === 0 && isNaN(dura)) {
            $("." + current).addClass("error");
            console.log("Skipping. Did not load.");
            nextSong();
        }
        else {
            console.log("Timeout function ran.");
        }
    }, 15000);
}

function updateProgress() {
    var time = document.getElementById(current).currentTime;
    var dura = document.getElementById(current).duration;
    var loadbar = loadbar = document.getElementById(current).buffered.end(0);
    var wid = document.getElementById("progressbg").offsetWidth;
    document.getElementById("currenttime").innerHTML = formatTime(time);
    document.getElementById("currentdura").innerHTML = formatTime(dura);
    var prog =  wid * (time / dura);
    var load = wid * (loadbar / dura);
    var w = prog;
    $("#progress").animate({ width : w + "px" }, 1);
    $("#loading").animate({ width : load + "px" }, 1);
}

/**
* Change milliseconds to minutes and seconds.
* // returns String
**/
function formatTime(sec) {
   var min = Math.floor(sec / 60); // round
   var sec = Math.floor(sec % 60);
   if (isNaN(min) || isNaN(sec)) {
       min = "0";
       sec = "0";
   }
   if (min < 10) {
       min = "0" + min;
   }
   if (sec < 10) {
       sec = "0" + sec;
   }
   return min + ":" + sec;
}

function loadMore() {
    postsStart = postsEnd;
    postsEnd += 30;
    var link = "https://" + username + ".tumblr.com/api/read/json?start=" + postsStart + "&num=" + postsTotal + "&type=audio&tagged=" + tagged;
    $("#loadmore").remove();
    if (postsStart <= postsTotal) {
        retrieveAPI(link);
    }
}

function shiftProgress(elem, e) {
    var pageX = e.pageX;
    var left = elem.offset().left;
    var dura = document.getElementById(current).duration;
    var width = document.getElementById("progressbg").offsetWidth;
    var position = pageX - left;
    if (!isNaN(dura)) {
       var newTime = ((position * dura) / width);
       document.getElementById(current).currentTime = newTime;
       $("#progress").css({ width : position + "px" });
    }
}

function getFirstAudioFile() {
  return audioFiles[0];
}

function getUsername() {
  return username;
}

function getRepeatBool() {
    return repeatBool;
}

function getShuffleBool() {
    return shuffleBool;
}

function setShuffleBool(b) {
    shuffleBool = b;
}

function setRepeatBool(b) {
    repeatBool = b;
}

function getIndex() {
    return index;
}

function filter() {
   $("#tracks").prepend(trackCache);

   $(".filterout").each(function() {
       var filterout = $(this).attr("id");
       $("." + filterout).remove();
   });

   $(".tune").unbind("click", pressedSong);
   $(".tune").bind("click", pressedSong);
}

function setFilter() {
	exitSong();
	filter();
	$("#tracks .tune").removeClass("highlight");
	current = $(".tune").first().attr("class");
	current = current.substring(current.indexOf("song-"), current.indexOf(" tune"));
	index = current.substring(current.indexOf("song-")+5, current.length);
	enterSong();
	$("#pause").click();
}

function getNumofHosts() {
   var sum = 0;
   if ($(".tune").hasClass("tumblr")) {
	sum += 1;
   }
   if ($(".tune").hasClass("soundcloud")) {
	sum += 1;
   }
  if ($(".tune").hasClass("bandcamp")) {
	sum += 1;
   }
   if ($(".tune").hasClass("spotify")) {
        sum += 1; 
   }
  return sum;
}

return {
    init: init,
    getIndex: getIndex,
    setRepeatBool: setRepeatBool,
    getRepeatBool: getRepeatBool,
    setShuffleBool: setShuffleBool,
    getShuffleBool: getShuffleBool,
    shiftProgress: shiftProgress,
    getFirstAudioFile: getFirstAudioFile,
    getUsername, getUsername,
    nextSong: nextSong,
    prevSong: prevSong,
    repeatSong: repeatSong,
    shuffleSong: shuffleSong,
    getNumofHosts: getNumofHosts,
    setFilter: setFilter,
    loadMore: loadMore
}

}();

window.onload = function() {
    boombox.init();
    $("#next").click(function() {
        if (boombox.getRepeatBool() === true) {
            boombox.repeatSong();
        }
        else if (boombox.getShuffleBool() === true) {
            boombox.shuffleSong();
        }
       else {
           boombox.nextSong();
       }
    });

    $("#prev").click(function() {
        if (boombox.getRepeatBool() === true) {
            boombox.repeatSong();
        }
        else if (boombox.getShuffleBool() === true) {
            boombox.shuffleSong();
        }
        else {
            boombox.prevSong();
        }
    });

    $("#player").append("<audio class='aud' src='" + boombox.getFirstAudioFile() + "' preload='auto' id='song-0' controls></audio>");
}

$(document).ready(function(){
    // mode stored in local storage
    if (typeof(Storage) !== "undefined") {
        console.log("Has storage. Mode is currently " + localStorage.mode + ".");
        if (localStorage.mode === "on") {
            $("body").addClass("bodyfilter");
	    $("#infobar, #tracks, #labels, #playerbar").addClass("filtered");
            $("#day").show();
            $("#night").hide();
        }
    } else {
        console.log("No storage support.");
    }

    $("#pause").hide();
    $("#buttons").fadeTo(600, 1);

    $("#usernamebar").submit(function(event){
       var value = $(this).find("input:first").val();
       location.replace("?username=" + value);
   });

   $("#tagbar").submit(function(event){
	var value = $(this).find("input:first").val().replace(/ /g, "+");
        if (window.boombox.getUsername() !== undefined) {
	    location.replace("?tag=" + value + "?username=" + boombox.getUsername());
	 }
	else {
	    $("#notif").show();
	}
   });

   $(".filtertype").click(function() {
	var hosts = boombox.getNumofHosts();
	var filtered = $(".filterout").length;
	   
	if (!(hosts < filtered) && hosts > 1) {
	    $(this).toggleClass("filterout");
	}
	else {
	    $(this).removeClass("filterout");
       }
       boombox.setFilter();
   });

   $("#repeat").click(function() {
       if ($(this).hasClass("on")) {
           boombox.setRepeatBool(false);
           $(this).removeClass("on");
       }
       else {
           boombox.setRepeatBool(true);
           $(this).addClass("on");
       }
   });

    $("#shuffle").click(function() {
        if ($(this).hasClass("on")) {
           boombox.setShuffleBool(false);
           $(this).removeClass("on");
       }
       else {
           boombox.setShuffleBool(true);
           $(this).addClass("on");
       }
   });

    $("#progressbg, #loading, #progress").click(function(e) {
        boombox.shiftProgress($(this), e);
    });
	
    $("#open").click(function() {
        $("#menuwrap").fadeIn();
	$("#open").hide();
	$("#close").show();
    });
 
    $("#close").click(function() {
       $("#open").show();
       $("#close").hide();
       $("#menuwrap").fadeOut();
    });

    $("#mode").click(function() {
        if (!$("body").hasClass("bodyfilter")) {
	    $("body").addClass("bodyfilter");
	    $("#infobar, #tracks, #labels, #playerbar").addClass("filtered");
            $("#day").show();
            $("#night").hide();
            localStorage.mode = "on";
        }
        else {
            $("body").removeClass("bodyfilter");
	    $("#infobar, #tracks, #labels, #playerbar").removeClass("filtered");
            $("#night").show();
            $("#day").hide();
            localStorage.mode = "off";
        }
    });

  $("#currently").click(function() {
	$("#more").show();
	$(this).hide();
    });

  $("#seeCurrent").click(function() {
	$("#currently").show();
	$("#more").hide();
    });

    $("#scrollTo").click(function() {
        var winWidth = $(window).width();
        var elem, scr = null;
        var scr = "+=" + ($(".highlight").first().offset().top - 45);

        if (winWidth >= 815) {
            var $elem = $("#tracks");
        }
        else {
            var $elem = $("body, html");
            scr = ($(".highlight").first().offset().top - 65);
        }

        $elem.animate({
            scrollTop : scr
        }, 500);
    });

    function jumpToSong() {
        var winWidth = $(window).width();
        if (winWidth < 875) {
            var triggerScroll = 1000;
            toSong = function() {
            var scroll = $(window).scrollTop();
                if (scroll > triggerScroll) {
                    $("#note").fadeIn();
                }
                else {
                    $("#note").fadeOut();
                }
            };
            toSong();
            $(window).on("scroll", function () {
                toSong();
            });

            $("#note").click(function() {
                $("html, body").animate({ scrollTop: ($(".highlight").first().offset().top - 65) }, 550);
                return false;
            });
        }
        return;
    }

    jumpToSong(); // if window is smaller than 875, adds button to corner.
});

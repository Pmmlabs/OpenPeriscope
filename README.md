<img align="right" src="https://raw.githubusercontent.com/Pmmlabs/OpenPeriscope/master/images/openperiscope.png">
# OpenPeriscope
Unofficial in-browser web client for Periscope (userscript)

### Using as standalone application

If you have [NW.js](http://nwjs.io) 12.x installed, you can run
```
 npm install
 nw . 
 ```
 in repo directory

Or, you can use pre-built executables from [Releases page](https://github.com/Pmmlabs/OpenPeriscope/releases)

On Windows, be sure to install PepperFlash (go to [https://get.adobe.com/ru/flashplayer/otherversions](https://get.adobe.com/ru/flashplayer/otherversions), choose OS, chose "PPAPI")

### Using as userscript

1. Install [userscript manager](https://greasyfork.org/help/installing-user-scripts)
1. Click to [link](https://raw.githubusercontent.com/Pmmlabs/OpenPeriscope/master/Periscope_Web_Client.user.js) and then "Install"
1. Navigate to http://example.net

In this case posting to chat will not work.

### Authorization

1. Type consumer secret of Periscope App (_Where do I get it?_ Hunt out. Reverse the app, steal from twitter's devs, or something [else](http://pastebin.com))
1. Click "Sign in with twitter"
1. Login to the Twitter (if not yet) and click "Authorize"
1. Here you go!

### Broadcasts downloading

With OpenPeriscope and FFmpeg, you can download live broadcasts and replays.

For live broadcasts:

1. Click to "Get stream link"
1. Right-click to "Live M3U link", then "Copy link"
1. `ffmpeg -i "your_link_here" -c copy -bsf:a aac_adtstoasc result.mp4` (or open your favourite media player, and paste link to it)

For replays:

1. Click to "Get stream link" 
1. Click to "Download replay M3U"
1. Navigate to your downloads directory, and there `ffmpeg -protocol_whitelist file,https,tls,hls,tcp -i playlist.m3u8 -c copy -bsf:a aac_adtstoasc result.mp4`

### API Documentation

Docs by @cjhbtn, actualized by me: http://static.pmmlabs.ru/OpenPeriscope

### Third-party software

1. jQuery https://jquery.com
1. CryptoJS http://crypto-js.googlecode.com
1. Leaflet http://leafletjs.com
1. Leaflet.markercluster https://github.com/Leaflet/Leaflet.markercluster
1. js-emoji https://github.com/iamcal/js-emoji
1. clipboard.js https://clipboardjs.com
1. jQuery Spoiler https://github.com/le717/jquery-spoiler
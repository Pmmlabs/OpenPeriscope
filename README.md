<img align="right" src="https://raw.githubusercontent.com/Pmmlabs/OpenPeriscope/master/images/openperiscope.png">
## OpenPeriscope
Unofficial in-browser client for Periscope (userscript)

### Using as standalone application

You can use pre-built executables from [Releases page](https://github.com/Pmmlabs/OpenPeriscope/releases), or 

1. Download NW.js v0.12.3: http://dl.nwjs.io/v0.12.3/
1. Unpack it and add path to PATH enviroment variable
1. Download and unpack [ffmpeg library](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases) to nw.js directory
1. Download and unpack [ffmpeg static build](https://ffmpeg.zeranoe.com/builds/) to OpenPeriscope directory
1. Download and install NPM (bundled with node.js): https://nodejs.org/download/release/latest/
1. Run in repo directory
```
 npm install
 nw . 
 ```
If you want to update pre-built version, you can use [this instructions](https://github.com/Pmmlabs/OpenPeriscope/wiki#how-to-update-portable-version-exe)

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

### Features

* All functions of mobile client (except broadcasting)
* Recording of live broadcasts
* Downloading of replays
* Notifications and automatic download, when broadcast from subscriptions starts
* Screenlists
* Chat history (also in SRT subtitles)
* Periscope API test

In userscript version, "Download" link is absent, so you can use FFmpeg (or other program) to download broadcasts:

Lives:<br>
`ffmpeg -i "your_link_here" -c copy -bsf:a aac_adtstoasc result.mp4`

Replays:<br>
`ffmpeg -protocol_whitelist file,https,tls,hls,tcp -i playlist.m3u8 -c copy -bsf:a aac_adtstoasc result.mp4`

### API Documentation

Docs by @cjhbtn, actualized by me: http://static.pmmlabs.ru/OpenPeriscope

### Screenshot

![screenshot](https://cloud.githubusercontent.com/assets/2682026/15555303/3540d09e-22d9-11e6-9934-fb84a201a0e9.png)

### Third-party software

1. jQuery https://jquery.com
1. CryptoJS http://crypto-js.googlecode.com
1. Leaflet http://leafletjs.com
1. Leaflet.markercluster https://github.com/Leaflet/Leaflet.markercluster
1. js-emoji https://github.com/iamcal/js-emoji
1. clipboard.js https://clipboardjs.com
1. jQuery Spoiler https://github.com/le717/jquery-spoiler
1. Split.js https://github.com/nathancahill/Split.js

### Donate
Buy me a beer: [paypal.me/pmmlabs](https://paypal.me/pmmlabs)<br>
Bitcoin: [1F1hXcaTjS1UFUqqMzLvVyz4wDSbRJU4Tn](bitcoin:1F1hXcaTjS1UFUqqMzLvVyz4wDSbRJU4Tn) 

// ==UserScript==
// @id          OpenPeriscope@pmmlabs.ru
// @name        Periscope Web Client
// @namespace   https://greasyfork.org/users/23
// @description Periscope client based on API requests. Visit example.net for launch.
// @include     https://api.twitter.com/oauth/authorize
// @include     http://example.net/*
// @version     1.8
// @author      Pmmlabs@github
// @grant       GM_xmlhttpRequest
// @connect     periscope.tv
// @connect     twitter.com
// @connect     digits.com
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.js
// @require     https://github.com/brix/crypto-js/raw/master/crypto-js.js
// @require     http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js
// @require     http://leaflet.github.io/Leaflet.markercluster/dist/leaflet.markercluster-src.js
// @require     https://github.com/iamcal/js-emoji/raw/master/lib/emoji.js
// @require     https://github.com/zenorocha/clipboard.js/raw/master/dist/clipboard.min.js
// @require     https://github.com/le717/jquery-spoiler/raw/master/jquery.spoiler.min.js
// @require     https://github.com/nathancahill/Split.js/raw/master/split.min.js
// @downloadURL https://github.com/Pmmlabs/OpenPeriscope/raw/master/Periscope_Web_Client.user.js
// @updateURL   https://github.com/Pmmlabs/OpenPeriscope/raw/master/Periscope_Web_Client.meta.js
// @icon        https://github.com/Pmmlabs/OpenPeriscope/raw/master/images/openperiscope.png
// @noframes
// ==/UserScript==

var emoji = new EmojiConvertor();
NODEJS = typeof GM_xmlhttpRequest == 'undefined';
var IMG_PATH = 'https://raw.githubusercontent.com/Pmmlabs/OpenPeriscope/master';
var settings = JSON.parse(localStorage.getItem('settings')) || {};
if (NODEJS) {  // for NW.js
    var gui = require('nw.gui');
    gui.App.addOriginAccessWhitelistEntry('https://api.twitter.com/', 'app', 'openperiscope', true);    // allow redirect to app://
    const https = require('https');
    const url = require('url');
    GM_xmlhttpRequest = function (options) {
        var onload = options.onload;
        options.onload = null;
        var u = url.parse(options.url);
        options.host = u.host;
        options.hostname = u.hostname;
        options.path = u.path;
        options.protocol = u.protocol;
        var chunks = '';
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunks += chunk;
            });
            res.on('end', function() {
                onload({
                    status: res.statusCode,
                    responseText: chunks
                });
            });
        });
        req.on('error', function (e) {
            console.error(e);
        });
        if (options.data)
            req.write(options.data);
        req.end();
        return req;
    };
    IMG_PATH = '';
    // Back & Forward hotkeys
    $(window).on('keydown', function (e) {
        if (e.keyCode == 8 && e.target == document.body) {  //backspace
            if (e.shiftKey)
                history.forward();
            else
                history.back();
        } else if (e.keyCode == 116)    //F5
            location.href='/index.html';
    });
    // default download path = executable path
    if (!settings.downloadPath)
        setSet('downloadPath', process.execPath.substring(0, process.execPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/')));
    if (settings.windowSize)
        window.resizeTo(settings.windowSize.width, settings.windowSize.height);
    setTimeout(function(){
        $(window).resize(function (e) {
            setSet('windowSize', {
                width: $(this).width(),
                height: $(this).height()
            });
        })
    }, 1000);
}
//<editor-fold desc="CSS style">
const css = '<style>\
    @media (max-width: 640px) {\
        div#left {\
            width: 0;\
        }\
        div#right {\
            margin-left: 20px;\
        }\
        div#left:hover {\
            width: 200px;\
        }\
        div#left:hover + div {\
            margin-left: 220px;\
        }\
    }\
    @media (max-width: 800px) {\
        div#userlist {\
            width: 0;\
        }\
        div#userlist:hover {\
            width: 200px;\
        }\
    }\
    @font-face {\
        font-family: "Roboto";\
        font-style: normal;\
        font-weight: 400;\
        src: local("Roboto"), local("Roboto-Regular"), url(' + IMG_PATH + '/fonts/Roboto-latin.woff2) format("woff2");\
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;\
    }\
    @font-face {\
        font-family: "Roboto";\
        font-style: normal;\
        font-weight: 400;\
        src: local("Roboto"), local("Roboto-Regular"), url(' + IMG_PATH + '/fonts/Roboto-cyrillic.woff2) format("woff2");\
        unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;\
    }\
    html, body, #left, #Map, #Chat, #map {\
        height: 100%;\
    }\
    body {\
        margin: 0;\
        font-family: "Roboto", sans-serif;\
        background: #fdfdfd;\
    }\
    body > div {\
        padding: 10px;\
    }\
    #secret, body > a {\
        margin: 10px;\
    }\
    body > input[type="text"] {\
        margin-left: 10px;\
    }\
    a, .edit {\
        color: #039be5;\
        text-decoration: none;\
        cursor: pointer;\
    }\
    input[type="text"], textarea {\
        border: none;\
        border-bottom: 1px solid #9e9e9e;\
        border-radius: 0;\
        outline: none;\
        height: 2rem;\
        margin: 0 10px 9px 0;\
        transition: box-shadow .3s;\
        background: transparent;\
    }\
    input[type="text"] {\
        font-size: 1rem;\
    }\
    textarea {\
        width: 500px;\
        height: 100px;\
        border-left: 1px solid transparent;\
        border-top: 1px solid transparent;\
        border-right: 1px solid transparent;\
    }\
    textarea:focus {\
        border-color: #E0E0E0;\
    }\
    input[type="text"]:focus, textarea:focus {\
        border-bottom: 1px solid #26a69a;\
        box-shadow: 0 1px 0 0 #26a69a;\
    }\
    #secret {\
        font-size:1.5em;\
        display: block;\
    }\
    .button {\
        border-radius: 2px;\
        line-height: 36px;\
        outline: 0px none;\
        padding: 0px 2rem;\
        text-transform: uppercase;\
        color: #FFF;\
        background-color: #26A69A;\
        letter-spacing: 0.5px;\
        cursor: pointer;\
        display: inline-block;\
        vertical-align: middle;\
        will-change: opacity, transform;\
        transition: all 0.3s ease-out 0s;\
        margin-right: 10px;\
        height: 36px;\
        overflow: hidden;\
    }\
    .button, .card, .contextmenu, .searcher {\
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.16), 0px 2px 10px 0px rgba(0, 0, 0, 0.12);\
    }\
    .button:hover {\
        background-color: #2bbbad;\
    }\
    .menu {\
        cursor: pointer;\
        transition: all 0.25s ease 0s;\
        color: #26A69A;\
        line-height: 1.5rem;\
        height: 1.5rem;\
        padding: 10px 20px;\
        margin: 0px;\
        border-bottom: 1px solid #E0E0E0;\
    }\
    .menu.active {\
        background-color: #26A69A;\
        color: #EAFAF9;\
    }\
    .menu:hover:not(.active), .contextmenu div:hover {\
        background-color: #f0f0f0;\
    }\
    #progress {\
        position: fixed;\
        top: 0;\
        left: 0;\
        width: 0;\
        z-index: 1;\
        padding: 0;\
        height: 2px;\
        background: #77b7ff;\
        box-shadow: 0 0 10px rgba(119,183,255,0.7);\
        -webkit-transition: width 10s ease;\
        transition: width 10s ease;\
    }\
    #left > a, #left > img {\
        margin-bottom: 5px;\
    }\
    #left > label {\
        display: block;\
        margin-bottom: 20px;\
    }\
    #left {\
        position: fixed;\
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.16), 0px 2px 10px 0px rgba(0, 0, 0, 0.12);\
        overflow: auto;\
        width: 200px;\
        transition: width 0.2s ease-out;\
    }\
    #right {\
        width: auto;\
        height: 95%;\
        margin-left: 220px;\
        transition: margin-left 0.2s ease-out;\
    }\
    .username, .leaflet-container a.username {\
        color: grey;\
        font-weight: bold;\
        max-height: 1.5em;\
        overflow: hidden;\
        text-overflow: ellipsis;\
        cursor: pointer;\
    }\
    #Map, #Chat, #map {\
        width:100%;\
    }\
    .live-cluster-small div{\
        background-color: rgba(222, 0, 0, 0.6);\
    }\
    .live-cluster-medium div {\
        background-color: rgba(180, 0, 0, 0.7);\
    }\
    .live-cluster-large div {\
        background-color: rgba(150, 0, 0, 0.9);\
    }\
    .replay-cluster-small div {\
        background-color: rgba(59, 51, 227, 0.6);\
    }\
    .replay-cluster-medium div {\
        background-color: rgba(43, 38, 174, 0.7);\
    }\
    .replay-cluster-large div {\
        background-color: rgba(33, 29, 128, 0.9);\
    }\
    .marker-cluster {\
        background-clip: padding-box;\
        border-radius: 20px;\
        background-color: white; \
    }\
    .marker-cluster div {\
        width: 36px;\
        height: 36px;\
        margin-left: 2px;\
        margin-top: 2px;\
        text-align: center;\
        border-radius: 18px;\
        font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;\
    }\
    .marker-cluster span {\
        line-height: 36px;\
        color: white;\
        font-weight: bold;\
    }\
    .leaflet-popup-content .description {\
        min-height: 128px;\
    }\
    .leaflet-popup-content {\
        width: 350px !important;\
    }\
    .description a {\
        font-weight: bold;\
    }\
    .description img {\
        float: left;\
        margin-right: 10px;\
    }\
    .icon {\
        padding-left: 25px;\
        background-repeat: no-repeat;\
        background-position: 5px center;\
    }\
    .chatlink {\
        background-image: url("' + IMG_PATH + '/images/comment-black.png");\
    }\
    .watching {\
        background-image: url("' + IMG_PATH + '/images/user-black.png");\
    }\
    .hearts {\
        background-image: url("' + IMG_PATH + '/images/heart-black.png");\
    }\
    .delete {\
        background-image: url("' + IMG_PATH + '/images/delete-black.png");\
        height: 14px;\
    }\
    .screenlist {\
        background-image: url("' + IMG_PATH + '/images/camera-black.png");\
        height: 14px;\
    }\
    .date {\
        background-image: url("' + IMG_PATH + '/images/calendar-black.png");\
    }\
    .time {\
        background-image: url("' + IMG_PATH + '/images/clock-black.png");\
    }\
     .friend_chat {\
        background-image: url("' + IMG_PATH + '/images/eye-black.png");\
    }\
    .is_locked {\
        background-image: url("' + IMG_PATH + '/images/lock-black.png");\
    }\
    .edit {\
        background-image: url("' + IMG_PATH + '/images/edit-black.png");\
    }\
    .lives {\
        background-image: url("' + IMG_PATH + '/images/video-black.png");\
    }\
    dt {\
        min-width: 150px;\
        float: left;\
        padding-top: 0.5rem;\
    }\
    #ApiTest input {\
        width: 500px;\
    }\
    pre {\
        background-color: #f0f0f0;\
        padding: 7px;\
        white-space: pre-wrap;\
        word-wrap: break-word;\
    }\
    .card {\
        font: 14px/1.3 "Helvetica Neue",Arial,Helvetica,sans-serif;\
        min-height: 128px;\
        margin: 0.5rem 0 1rem 0;\
        background-color: #fff;\
        border-radius: 2px;\
        min-width: 350px;\
    }\
    .card .description {\
        padding-top: 10px;\
        padding-right: 10px;\
    }\
    .card.RUNNING img {\
        border-color: #ED4D4D;;\
    }\
    .card.ENDED img {\
        border-color: #4350E9;\
    }\
    .card img {\
        height: 128px;\
        border-right: 5px solid;\
        margin-top: -10px;\
        min-width: 72px;\
    }\
    /* CHAT */\
    #userlist {\
        float: right;\
        width: 250px;\
        transition: width 0.2s ease-out;\
    }\
    #chat {\
        word-break: break-all;\
    }\
    #chat, #userlist {\
        border: 1px solid #bcbcbc;\
        height: 84%;\
        padding: 5px;\
        overflow-y: auto;\
    }\
    #resultConsole {\
        overflow-y: auto;\
        height: 300px; \
    }\
    .user {\
        white-space: nowrap;\
    }\
    #chat .user {\
        color: #2927cc;\
        cursor: pointer;\
    }\
    #userlist .user {\
        cursor: default;\
    }\
    .user div {\
        display: inline;\
    }\
    #title {\
        font-size: 16px;\
    }\
    #presence {\
        text-align: right;\
    }\
    #sendLike {\
        -webkit-touch-callout: none;\
        -webkit-user-select: none;\
        -khtml-user-select: none;\
        -moz-user-select: none;\
        -ms-user-select: none;\
        user-select: none;\
    }\
    #underchat {\
        padding-top: 5px;\
    }\
    #underchat label {\
        margin-top: 0.5em;\
    }\
    #underchat div {\
        margin-right: 310px;\
    }\
    #message {\
        width: 100%;\
    }\
    .service {\
        color: green;\
    }\
    .error {\
        color: red;\
    }\
    /* EMOJI */\
    span.emoji {\
        display: inline-block;\
        width: 1.5em;\
        height: 1.5em;\
        background-size: contain;\
    }\
    span.emoji-sizer {\
        margin: -2px 0;\
    }\
    span.emoji-outer {\
        display: inline-block;\
        height: 1.5em;\
        width: 1.5em;\
    }\
    span.emoji-inner {\
        display: inline-block;\
        width: 100%;\
        height: 100%;\
        vertical-align: baseline;\
    }\
    img.emoji {\
        width: 1.5em;\
        height: 1.5em;\
    }\
    /* USER */\
    img.avatar {\
        border: none;\
        background: url("' + IMG_PATH + '/images/default_avatar.png");\
    }\
    #People .username {\
        font-size: 17px;\
    }\
    #followers {\
        width: 50%;\
        float: right;\
    }\
    #following {\
        width: 48%;\
        float: left;\
    }\
    .twitterlink:hover g, .periscopelink:hover .tofill {\
        fill: #59adeb;\
    }\
    .featured {\
        padding: 3px;\
        margin-left: 10px;\
        border-radius: 3px;\
        color: white;\
    }\
    .card .userdescription {\
        overflow: hidden;\
        max-height: 2.8em;\
        text-overflow: ellipsis;\
    }\
    .right {\
        float: right;\
    }\
    .contextmenu {\
        position: absolute;\
        padding: 0;\
        background: white;\
    }\
    .contextmenu div {\
        padding: 5px;\
        cursor: pointer;\
    }\
    .spoiler-content-visible {\
        padding: 5px;\
        background: #fbfbfb;\
        height: auto !important;\
    }\
    /* Split.js */\
    .gutter {\
        background-color: #eee;\
        background-repeat: no-repeat;\
        background-position: 50%;\
    }\
    .gutter.gutter-horizontal {\
        background-image: url("' + IMG_PATH + '/images/vertical.png");\
        cursor: ew-resize;\
    }\
    .split, .gutter.gutter-horizontal {\
        height: 100%;\
        float: left;\
    }\
    .split {\
        -webkit-box-sizing: border-box;\
        -moz-box-sizing: border-box;\
        box-sizing: border-box;\
        overflow-y: auto;\
        overflow-x: hidden;\
    }\
    img.lock {\
        height: 14px;\
        width: 14px;\
        margin-left: -30px;\
        min-width: 14px;\
        margin-top: 100px;\
        border: none;\
    }\
    .bullets {\
        background-image: url("' + IMG_PATH + '/images/bullets-black.png");\
        width: 14px;\
        height: 14px;\
        display: block;\
        margin: 11px;\
    }\
    .searcher {\
        background: white;\
        padding: 0 10px;\
    }\
    .searcher input, .searcher input:focus {\
        border: none;\
        box-shadow: none;\
        margin: 0;\
    }\
    .button.following {\
            background-color: #37279B;\
        }\
    .button.following:hover {\
        background-color: #685AC0;\
    }\
</style>';
//</editor-fold>

if (location.href == 'https://api.twitter.com/oauth/authorize') {
    location.href = $('meta[http-equiv="refresh"]').attr('content').substr(6).replace('twittersdk://openperiscope/index.html', 'http://example.net/');
} else {
    $('style').remove();
    $(document.head).append(css).append('<meta name="referrer" content="no-referrer" />');

    document.title = 'OpenPeriscope';
    var oauth_token = localStorage.getItem('oauth_token'),
        oauth_verifier = localStorage.getItem('oauth_verifier'),
        session_key = localStorage.getItem('session_key'),
        session_secret = localStorage.getItem('session_secret'),
        loginTwitter = localStorage.getItem('loginTwitter');

    $(function() {
        if (loginTwitter) {
            loginTwitter = JSON.parse(loginTwitter);
            Ready(loginTwitter);
            refreshProfile();
        } else if (session_key && session_secret) {
            SignIn3(session_key, session_secret);
        } else if (oauth_token && oauth_verifier) {
            SignIn2(oauth_token, oauth_verifier);
        } else if ((oauth_token = getParameterByName('oauth_token')) && (oauth_verifier = getParameterByName('oauth_verifier'))) {
            localStorage.setItem('oauth_token', oauth_token);
            localStorage.setItem('oauth_verifier', oauth_verifier);
            SignIn2(oauth_token, oauth_verifier);
        } else {
            var signInButton = $('<a class="button">Sign in with twitter</a>').click(SignIn1);
            var signInSMSButton = $('<a class="button">Sign in with SMS</a>').click(SignInSMS);
            $(document.body).html('<input type="text" id="secret" size="60" placeholder="Enter periscope consumer secret here..." value="' +
                (settings.consumer_secret || '') + '"/><br/>').append(signInButton, signInSMSButton);
        }
        $(document.body).append(Progress.elem);
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function lazyLoad(parent) {
    var right = $('#right');
    $(parent).on('scroll', function () {
        clearTimeout($.data(this, 'scrollTimer'));      // for preventing dozens of firing
        $.data(this, 'scrollTimer', setTimeout(function () {
            var windowHeight = $(window).height();
            var scrollTop = $(window).scrollTop();
            right.find('img[lazysrc]:visible').each(function () {
                var el = $(this);
                var top = el.offset().top;
                if (scrollTop < top + el.height() + 100 && scrollTop + windowHeight + 100 > top) {  // 100 is handicap
                    el.attr('src', el.attr('lazysrc'));
                    el.removeAttr('lazysrc');
                }
            })
        }, 100));
    });
}
var selfAvatar;
function Ready(loginInfo) {
    console.log('ready! ', loginInfo);
    var signOutButton = $('<a class="button">Sign out</a>');
    signOutButton.click(SignOut);

    var userLink = $('<a class="username">@' + (loginInfo.user.username || loginInfo.user.twitter_screen_name) + '</a>').click(switchSection.bind(null, 'User', loginInfo.user.id));
    var userEdit = $('<span class="right icon edit" title="Profile & settings">&nbsp;</span>').click(switchSection.bind(null, 'Edit'));
    loginInfo.user.profile_image_urls.sort(function (a, b) {
        return a.width * a.height - b.width * b.height;
    });
    selfAvatar = $('<img src="' + loginInfo.user.profile_image_urls[0].url + '" width="140"/>');
    var left = $('<div id="left"/>').append(signOutButton,
        selfAvatar, userEdit,
        '<div>' + emoji.replace_unified(loginInfo.user.display_name) + '</div>', userLink);
    $(document.body).html(left).append('<div id="right"/>', Progress.elem);
    var menu = [
        {text: 'API test', id: 'ApiTest'},
        {text: 'Map', id: 'Map'},
        {text: 'Top', id: 'Top'},
        {text: 'Following', id: 'Following'},
        {text: 'Search broadcasts', id: 'Search'},
        {text: 'New broadcast', id: 'Create'},
        {text: 'Chat', id: 'Chat'},
        {text: 'Suggested people', id: 'People'},
        {text: 'User', id: 'User'}
    ];
    if (NODEJS)
        menu.push({text: 'Downloading', id: 'Console'});
    for (var i in menu) {
        var link = $('<div class="menu" id="menu'+menu[i].id+'">' + menu[i].text + '</div>');
        link.click(switchSection.bind(null, menu[i].id));
        left.append(link);
    }
    $('.menu').first().click();
    $('#menuCreate').hide(); // Create broadcasts only for developers
    left.append($('<label title="All API requests will be logged to console"/>').append($('<input type="checkbox" id="debug"/>').click(function(){
        $('#menuCreate').toggle();
    }), 'Debug mode'));
    emoji.img_sets[emoji.img_set].path = 'http://unicodey.com/emoji-data/img-apple-64/';
    lazyLoad(window);
    $(window).on('popstate', function(event) {
        event = event.originalEvent;
        if (event.state && event.state.section)
            switchSection(event.state.section, event.state.param, true);
    });
    Notifications.start();
}
var Notifications = {
    interval: null,
    notifs_available: null,
    old_list: null,
    default_interval: 15,
    start: function () {
        if (!this.interval) {
            if (typeof this.notifs_available !== 'boolean') {
                this.notifs_available = false;
                if ("Notification" in window && Notification.permission === "granted")
                    this.notifs_available = true;
                else if (Notification.permission !== 'denied')
                    Notification.requestPermission(function (permission) {
                        if (permission === "granted")
                            Notifications.notifs_available = true;
                    });
            }
            this.old_list = JSON.parse(localStorage.getItem('followingBroadcastFeed')) || [];
            if (!settings.followingInterval)
                setSet('followingInterval', this.default_interval);
            if (settings.followingNotifications || settings.automaticDownload)
                this.interval = setInterval(Api.bind(null, 'followingBroadcastFeed', {}, function (new_list) {
                    for (var i in new_list) {
                        var contains = false;
                        for (var j in Notifications.old_list)
                            if (Notifications.old_list[j].id == new_list[i].id) {
                                contains = true;
                                break;
                            }
                        if (!contains) { // NEW BRDCST!
                            // Show notification
                            if (settings.followingNotifications && Notifications.notifs_available) {
                                setTimeout(function (i) {   // fix for massive firing
                                    return function () {
                                        var date_created = new Date(new_list[i].start);
                                        var start = date_created.getFullYear() + '-' + zeros(date_created.getMonth() + 1) + '-' + zeros(date_created.getDate()) + '_' + zeros(date_created.getHours()) + ':' + zeros(date_created.getMinutes());
                                        new Notification(new_list[i].user_display_name + (new_list[i].state == 'RUNNING' ? ' is live now' : ' uploaded replay'), {
                                            body: '[' + start + '] ' + (new_list[i].status || 'Untitled'),
                                            icon: new_list[i].image_url
                                        }).onclick = function () {
                                            window.open('https://www.periscope.tv/w/' + new_list[i].id);
                                            this.close();
                                        };
                                    };
                                }(i), 300 * i);
                            }
                            // Start the record
                            if (settings.automaticDownload && new_list[i].state == 'RUNNING' && NODEJS) {
                                var downloadBroadcast = false;

                                if (settings.privateDownload && new_list[i].is_locked)
                                    downloadBroadcast = true;
                                else if (settings.sharedDownload && new_list[i].share_user_ids)
                                    downloadBroadcast = true;
                                else if (settings.followingDownload && !new_list[i].share_user_ids)
                                    downloadBroadcast = true;

                                if (downloadBroadcast) {
                                    getURL(new_list[i].id, function (live, replay, cookies, _name, _user_id, _user_name) {
                                        var ffmpeg_cookies = [];
                                        for (var i in cookies)
                                            ffmpeg_cookies.push(cookies[i].Name + '=' + cookies[i].Value);
                                        if (live)
                                            download(_name, live, ffmpeg_cookies, _user_id, _user_name);
                                        else if (replay)
                                            download(_name, replay, ffmpeg_cookies, _user_id, _user_name);
                                    });
                                }
                            }
                        }
                    }
                    Notifications.old_list = new_list;
                    localStorage.setItem('followingBroadcastFeed', JSON.stringify(Notifications.old_list));
                }), (settings.followingInterval || this.default_interval) * 1000);
        }
    },
    stop: function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};
function switchSection(section, param, popstate) {
    // Switch menu
    $('.menu.active').removeClass('active');
    $('#menu'+section).addClass('active');
    // Switch content
    $('#right > div:visible').hide();
    if (param && param.target)  // jQuery event
        param = null;
    if (popstate != true)
        history.pushState({section: section, param: param}, section, '/' + section + (param ? '/' + (param.url ? param.url : param) : ''));
    var sectionContainer = $('#' + section);
    if (!sectionContainer.length)
        Inits[section]();
    else
        sectionContainer.show();
    if (param)
        switch (section) {
            case 'User':
                if ($('#user_id').val() != param) {
                    $('#user_id').val(param);
                    $('#showuser').click();
                }
                break;
            case 'Chat':
                if ($('#broadcast_id').val() != param) {
                    $('#broadcast_id').val(param);
                    $('#startchat').click();
                }
                break;
            case 'Map':
                var latlng = param.split(',');
                var mapcenter = map.getCenter();
                if (latlng[0] != mapcenter.lat || latlng[1] != mapcenter.lng)
                    map.setView([latlng[0], latlng[1]], 17);
                break;
            case 'Console':
                param = $.extend({
                    url:'',
                    cookies: '',
                    name:'',
                    user_id:'',
                    user_name:''
                }, param);
                if ($('#download_url').val() != param.url) {    // if it other video
                    $('#download_url').val(param.url);
                    $('#download_cookies').val(param.cookies);
                    $('#download_name').val(param.name);
                    $('#download_userid').val(param.user_id);
                    $('#download_username').val(param.user_name);
                    $('#download').click();
                }
                break;
        }
    document.title = section + ' - ' + 'OpenPeriscope';
}
var Progress = {
    elem: $('<div id="progress"/>'),
    count: 0,
    start: function(){
        this.count++;
        this.elem.css('visibility', 'visible');
        this.elem.css('width', Math.floor(100/this.count)+'%');
    },
    stop: function(){
        this.count--;
        if (!this.count) {  // if there is no unfinished requests
            this.elem.css('width', '0');
            this.elem.css('visibility', 'hidden');
        } else
            this.elem.css('width', Math.floor(100/this.count)+'%');
    }
};
var languageSelect = '<dt>Language: <select class="lang">\
            <option>ar</option>\
            <option>de</option>\
            <option>en</option>\
            <option>es</option>\
            <option>fi</option>\
            <option>fr</option>\
            <option>hy</option>\
            <option>id</option>\
            <option>it</option>\
            <option>ja</option>\
            <option>kk</option>\
            <option>other</option>\
            <option>pt</option>\
            <option>ro</option>\
            <option>ru</option>\
            <option>sv</option>\
            <option>tr</option>\
            <option>uk</option>\
            <option>zh</option>\
        </select></dt>';
function refreshProfile() {
    Api('user', {
        user_id: loginTwitter.user.id
    }, function (userResponse) {
        loginTwitter.user = userResponse.user;
        localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
        loginTwitter.user.profile_image_urls.sort(function (a, b) {
            return a.width * a.height - b.width * b.height;
        });
        if (selfAvatar.attr('src') != loginTwitter.user.profile_image_urls[0].url)
            selfAvatar.attr('src', loginTwitter.user.profile_image_urls[0].url);
    })
}
var Inits= {
Map: function () {
    $(document.head).append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />',
        '<link rel="stylesheet" href="http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css" />');
    var mapList = $('<div class="split"/>');
    $('#right').append($('<div id="Map"/>').append('<div id="map" class="split"/>',mapList));
    // Set center
    map = L.map('map', {zoomControl: false}).setView([0, 0], 2);

    // Layers list
    var tileLayers = {
        "Open Street Map": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; OpenStreetMap'
        }).addTo(map),
        "Mapbox": L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpamV0Zms2ZzAwMGh0Zm01MDR3YmV2cHgifQ.m9a-_eKcMy9A6glxEtuj3Q', {
            attribution: 'Map data &copy; OpenStreetMap'
        }),
        "Google": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
            subdomains: '123',
            attribution: 'Map data &copy; Google'
        })
    };
    L.control.layers(tileLayers).addTo(map);
    // Split panel opener
    var splitPanelEnabled = false;
    L.Control.PanelButton = L.Control.extend({
        onAdd: function(amap) {
            return $('<div class="leaflet-control-layers leaflet-control"/>')
                .append($('<a class="bullets" title="Toggle broadcasts list"/>').click(function(){
                    if (splitPanelEnabled) {
                        $('.gutter').remove();
                        $(amap.getContainer()).css('width','');
                        mapList.css('width','0');
                    } else {
                        Split($('.split'), {
                            sizes: [80, 20],
                            minSize: [100, 100]
                        });
                    }
                    splitPanelEnabled = !splitPanelEnabled;
                }))
                .get(0);
        },

        onRemove: function(amap) {
        }
    });
    new L.Control.PanelButton().addTo(map);
    // Search
    var searcher = false;
    L.Control.Searcher = L.Control.extend({
        onAdd: function (amap) {
            return $('<div class="leaflet-control searcher"/>')
                .append($('<input type="text" placeholder="Search..."/>')
                    .mousemove(function () {return false})
                    .dblclick(function () {return false})
                    .keypress(function (e) {
                        if (e.keyCode == 13) {
                            var $this = $(this);
                            $.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                address: $(this).val(),
                                key: 'AIzaSyChqVpIwX4UYEh-1Rza_OqTl1OwYfupWBE'  // key quota is 2500 requests per day \_(-_-)_/
                            }, function (r) {
                                if (r.results.length) {
                                    amap.fitBounds([
                                        [r.results[0].geometry.viewport.southwest.lat, r.results[0].geometry.viewport.southwest.lng],
                                        [r.results[0].geometry.viewport.northeast.lat, r.results[0].geometry.viewport.northeast.lng]
                                    ]);
                                } else {
                                    $this.css('transition', '');
                                    $this.css('color', 'red');
                                    setTimeout(function () {
                                        $this.css('transition', 'color 4s ease-out');
                                        $this.css('color', '');
                                    }, 100);
                                }
                            });
                            return false;
                        }
                    }))
                .get(0);
        }
    });
    new L.Control.Searcher({position: 'topleft'}).addTo(map);
    new L.Control.Zoom().addTo(map);
    // Cluster icons
    var iconCreate = function (prefix) {
        return function (cluster) {
            var childCount = cluster.getChildCount();
            var c = ' ' + prefix + '-cluster-';
            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(40, 40)
            });
        };
    };
    var replay = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 16,
        singleMarkerMode: true,
        iconCreateFunction: iconCreate('replay')
    }).addTo(map);
    var live = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 16,
        singleMarkerMode: true,
        iconCreateFunction: iconCreate('live')
    }).addTo(map);
    var refreshMap = function () {
        //if (e && e.hard === false) return;    // zoom change case
        var mapBounds = map.getBounds();
        clearXHR();
        if (mapBounds._northEast.lat == mapBounds._southWest.lat && mapBounds._northEast.lng == mapBounds._southWest.lng)
            console.warn('Map is out of mind');
        Api('mapGeoBroadcastFeed', {
            "include_replay": true,
            "p1_lat": mapBounds._northEast.lat,
            "p1_lng": mapBounds._northEast.lng,
            "p2_lat": mapBounds._southWest.lat,
            "p2_lng": mapBounds._southWest.lng
        }, function (r) {
            var openLL; // for preventing of closing opened popup
            live.eachLayer(function (layer) {
                if (layer.getPopup()._isOpen)
                    openLL = layer.getLatLng();
                else
                    live.removeLayer(layer);
            });
            replay.eachLayer(function (layer) {
                if (layer.getPopup()._isOpen)
                    openLL = layer.getLatLng();
                else
                    replay.removeLayer(layer);
            });
            // adding markers
            for (var i = 0; i < r.length; i++) {
                var stream = r[i];
                var marker = L.marker(new L.LatLng(stream.ip_lat, stream.ip_lng), {title: stream.status || stream.user_display_name});
                if (!marker.getLatLng().equals(openLL)) {
                    var description = getDescription(stream);
                    marker.bindPopup(description);
                    marker.on('popupopen', getM3U.bind(null, stream.id, $(description)));
                    marker.on('popupopen', Api.bind(null, 'getBroadcasts', {
                        broadcast_ids: [stream.id],
                        only_public_publish: true
                    }, function (info) {
                        $('.leaflet-popup-content .watching').text(info[0].n_watching + info[0].n_web_watching);
                    }));
                    marker.on('popupopen', function (e) {
                        var img = $(e.popup._content).find('img');
                        img.attr('src', img.attr('lazysrc'));
                        img.removeAttr('lazysrc');
                    });
                    (stream.state == 'RUNNING' ? live : replay).addLayer(marker);
                }
            }
            if (splitPanelEnabled)
                refreshList(mapList)(r);
        });
        var mapCenter = map.getCenter();
        history.replaceState({
            section: 'Map',
            param: mapCenter.lat + ',' + mapCenter.lng
        }, 'Map', '/Map/' + mapCenter.lat + ',' + mapCenter.lng);
    };
    if (!history.state.param) {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(function (position) {
                map.setView([position.coords.latitude, position.coords.longitude], 11);
                refreshMap();
            }, function(){
                refreshMap();
            });
    }
    map.on('moveend', refreshMap);
    lazyLoad(mapList);
},
ApiTest: function () {
    var submitButton = $('<a class="button">Submit</div>');
    submitButton.click(function () {
        try {
            $('#ApiTest form').submit();
            var method = $('#method').val().trim();
            if (method == '')
                throw Error('Method is empty');
            var params = $('#params').val().trim();
            if (params == '') {
                params = '{}';
                $('#params').text(params);
            }
            Api(method, JSON.parse(params), function (response) {
                $('#response').html(JSON.stringify(response, null, 4));
            }, function (error) {
                $('#response').text(error);
            });
        } catch (e) {
            $('#response').text(e.toString());
        }
    });
    $('#right').append(
        $('<div id="ApiTest"/>').append(
            '<a href="https://github.com/Pmmlabs/OpenPeriscope"><img style="position: absolute; top: 0; right: 0; border: 0;" src="' + IMG_PATH + '/images/forkme.png" alt="Fork me on GitHub"></a>' +
            'Some documentation can be found in <a href="http://static.pmmlabs.ru/OpenPeriscope" target="_blank">docs by @cjhbtn</a>' +
            '<br/><dt>Method</dt><iframe id="forautocomplete" name="forautocomplete" style="display: none;"></iframe><form target="forautocomplete"><input id="method" type="text" placeholder="mapGeoBroadcastFeed" autocomplete="on"/></form><br/>' +
            '<dt>Parameters</dt><textarea id="params" placeholder=\'{"include_replay": true, "p1_lat": 1, "p1_lng": 2, "p2_lat": 3, "p2_lng": 4}\'/><br/><br/>'
            , submitButton, '<br/><br/><pre id="response"/>Response is also displayed in the browser console, if [Debug mode] is checked</pre>')
    );
},
Top: function () {
    var featured = $('<div/>');
    var ranked = $('<div/>');
    var langDt = $(languageSelect);
    langDt.find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
    var button = $('<a class="button">Refresh</a>').click(function () {
        Api('rankedBroadcastFeed', {languages: [langDt.find('.lang').val()]}, refreshList(ranked, '<h3>Ranked</h3>'));
        Api('featuredBroadcastFeed', {}, refreshList(featured, '<h3>Featured</h3>'));
    });
    $('#right').append($('<div id="Top"/>').append(langDt, button, featured, ranked));
    button.click();
},
Search: function () {
    var searchResults = $('<div/>');
    var channels = $('<div/>');
    var searchBroadcast = function (query) {
        if (typeof query == 'string')
            input.val(query);
        Api('broadcastSearch', {
            search: input.val(),
            include_replay: $('#includeReplays')[0].checked
        }, refreshList(searchResults, '<h3>Search results for '+input.val()+'</h3>'));
    };
    var searchButton = $('<a class="button">Search</a>').click(searchBroadcast);
    var langDt = $(languageSelect).change(RefreshChannels);
    langDt.find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
    var authorization_token;

    function ApiChannels(callback, cid) {
        Progress.start();
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://channels.periscope.tv/v1/channels' + (cid ? '/' + cid + '/broadcasts' : ''),
            headers: {
                Authorization: authorization_token,
                locale: langDt.find('.lang').val()
            },
            onload: function (r) {
                Progress.stop();
                if (r.status == 200) {
                    var response = JSON.parse(r.responseText);
                    if ($('#debug')[0].checked)
                        console.log('channels' + (cid ? ' cid ' + cid : '') + ': ', response);
                    callback(response);
                }
                else
                    console.log('channels error: ' + r.status + ' ' + r.responseText);
            }
        });
    }

    function RefreshChannels() {
        Api('authorizeToken', {
            service: 'channels'
        }, function (authorizeToken) {
            authorization_token = authorizeToken.authorization_token;
            ApiChannels(function (response) {
                channels.empty();
                for (var i in response.Channels) {
                    var channel = response.Channels[i];
                    var Name = $('<a>' + channel.Name + '</a>').click(searchBroadcast.bind(null, channel.Name));
                    var PublicTag = $('<a>' + channel.PublicTag + '</a>').click(searchBroadcast.bind(null, channel.PublicTag));
                    var PublicChannel = $('<a>' + channel.Name + '</a>').click(ApiChannels.bind(null, function (channelName) {
                        return function (chan) {
                            var ids = [];
                            for (var i in chan.Broadcasts)
                                ids.push(chan.Broadcasts[i].BID);
                            Api('getBroadcasts', {
                                broadcast_ids: ids,
                                only_public_publish: true
                            }, refreshList(searchResults, '<h3>' + channelName + ', ' + chan.NLive + ' lives, ' + chan.NReplay + ' replays</h3>'));
                        };
                    }(channel.Name), channel.CID));
                    channels.append($('<p/>').append('<div class="lives right icon" title="Lives / Replays">' + channel.NLive + ' / ' + channel.NReplay + '</div>',
                        PublicChannel, (channel.Featured ? ' FEATURED<br>' : ''), '<br>',
                        (channel.PublicTag ? ['Tags: ', Name, ', ', PublicTag, '<br>'] : ''),
                        'Description: ' + channel.Description)
                    );
                }
            });
        });
    }

    var input = $('<input type="text">').keypress(function (e) {
        if (e.keyCode == 13) {
            searchBroadcast();
            return false;
        }
    });
    $('#right').append($('<div id="Search"/>').append(input, '<label><input id="includeReplays" type="checkbox"> Include replays</label>&nbsp;&nbsp;&nbsp;', searchButton,
        '<h3>Channels</h3>', langDt, '<br><br>', channels, searchResults));
    RefreshChannels();
},
Following: function () {
    var result = $('<div/>');
    var button = $('<a class="button">Refresh</a>').click(Api.bind(null, 'followingBroadcastFeed', {}, refreshList(result)));
    $('#right').append($('<div id="Following"/>').append(button, result));
    button.click();
},
Create: function () {
    $('#right').append('<div id="Create">' +
        '<dt>Title:</dt><input id="status" type="text" autocomplete="on"><br/>' +
        '<dt>Width:</dt><input id="width" type="text" autocomplete="on" placeholder="320"><br/>' +
        '<dt>Height:</dt><input id="height" type="text" autocomplete="on" placeholder="568"><br/>' +
        '<dt>Filename:</dt><input id="filename" type="text" autocomplete="on"><label><input id="camera" type="checkbox"> From camera</label><br/>' +
        '<dt>Streaming bitrate:</dt><input id="bitrate" type="text" value="200">kBps<br/>' +
        '<dt>Latitude:</dt><input id="lat" type="text" placeholder="0"><br/>' +
        '<dt>Longitude:</dt><input id="lon" type="text" placeholder="0"><br/>' +
        '<dt>Language:</dt><input id="cr_lang" type="text" value="'+(navigator.language || navigator.userLanguage || "en").substr(0, 2)+'"><br/>' +
        '<dt>Server:</dt><select id="server">' +
            '<option>us-west-1</option>' +
            '<option selected>eu-central-1</option>' +
        '</select><br/>' +
        '<br/><div style="clear: left;"><label><input id="friend_chat" type="checkbox"> Limit the chat to friends only</label></div><br/>' +
        '<br/></div>');
    $('#camera').click(function(){
        $('#filename').val(this.checked ? '/dev/video0' : '');
    });
    var createButton = $('<a class="button">Create</a>').click(function () {
        var widthInput = $('#width');
        var heightInput = $('#height');
        if (widthInput.val().trim() == '')
            widthInput.val(320);
        if (heightInput.val().trim() == '')
            heightInput.val(568);
        Api('createBroadcast', {
            lat: +$('#lat').val() || 0,
            lng: +$('#lon').val() || 0,
            //supports_psp_version: [1, 0, 0],
            region: $('#server').val(),
            width: +widthInput.val(),
            height: +heightInput.val()
        }, function (createInfo) {
            Api('publishBroadcast', {
                broadcast_id: createInfo.broadcast.id,
                friend_chat: $('#friend_chat')[0].checked,
                has_location: true,
                locale: $('#cr_lang').val(),
                lat: +$('#lat').val() || 0,
                lng: +$('#lon').val() || 0,
                status: $('#status').val().trim()
            }, function () {
                var filename = $('#filename').val();
                var input_options = ($('#camera')[0].checked ? '-f v4l2 -framerate 25 -video_size 640x480' : '') + ' -i "' + filename + '"';
                var code =
                    '#!/bin/bash\n' +
                    'FFOPTS="-vcodec libx264 -b:v ' + $('#bitrate').val() + 'k -profile:v main -level 2.1 -s ' + createInfo.broadcast.width + 'x' + createInfo.broadcast.height + ' -aspect ' + createInfo.broadcast.width + ':' + createInfo.broadcast.height + '"\n' +
                    'ffmpeg -loglevel quiet ' + input_options + ' $FFOPTS -vbsf h264_mp4toannexb -t 1 -an out.h264\n' + // converting to Annex B mode for getting right NALs
                    'SPROP=$(h264_analyze out.h264 2>&1 | grep -B 6 SPS | head -n1 | cut -c 4- | xxd -r -p | base64)","$(h264_analyze out.h264 2>&1 | grep -B 5 PPS | head -n1 | cut -c 4- | xxd -r -p | base64)\n' + // generating "sprop..."
                    'rm -f out.h264\n' +    // delete temp file
                    'ffmpeg ' + input_options + ' -r 1 -s ' + createInfo.broadcast.width + 'x' + createInfo.broadcast.height + ' -vframes 1 -y -f image2 orig.jpg\n' +
                    'curl -s -T orig.jpg -H "content-type:image/jpeg" "' + createInfo.thumbnail_upload_url + '"\n' +
                    'rm -f orig.jpg\n' +
                    'ffmpeg -re ' + input_options + ' $FFOPTS -metadata sprop-parameter-sets="$SPROP"' +
                    ' -strict experimental -acodec aac -b:a 128k -ar 44100 -ac 1 -f flv' +
                    ' rtmp://' + createInfo.host + ':' + createInfo.port + '/'+createInfo.application+'?t=' + createInfo.credential + '/' + createInfo.stream_name + ' < /dev/null &\n' +
                    'while true\n' +
                    ' do\n' +
                    '  echo -e "\\033[0;32m[OpenPeriscope] `curl -s --form "cookie=' + loginTwitter.cookie + '" --form "broadcast_id=' + createInfo.broadcast.id + '" https://api.periscope.tv/api/v2/pingBroadcast`\\033[0m"\n' +
                    '  sleep 20\n' +
                    ' done\n' +
                    'curl --form "cookie=' + loginTwitter.cookie + '" --form "broadcast_id=' + createInfo.broadcast.id + '" https://api.periscope.tv/api/v2/endBroadcast';
                var sh = 'stream_' + filename + '.sh';
                $('#Create').append('<pre>' + code + '</pre>',
                    $('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(code) + '" download="' + sh + '">Download .SH</a>').click(saveAs.bind(null, code, sh)),
                    $('<div class="card RUNNING"/>').append(getDescription(createInfo.broadcast)));
            });
            //var broadcast = response.broadcast;
        });
    });
    $('#Create').append(createButton);
},
Chat: function () {
    var broadcast_id = $('<input id="broadcast_id" type="text" size="15" placeholder="broadcast id">');
    var title = $('<span id="title"/>');
    var userlist = $('<div id="userlist"/>');
    var chat = $('<div id="chat"/>');
    var textBox = $('<input type="text" id="message">');
    var historyDiv = $('<div/>');
    if (NODEJS) {
        WebSocket = require('ws');
        $(window).on('unload', function(){
            if (ws)
                ws.close();
        });
    }

    function userlistAdd(user){
        var id = user.id || user.remoteID || user.user_id;
        if (!userlist.find('#'+id).length && (user.display_name || user.displayName))
            userlist.append($('<div class="user" id="' + id + '">' + emoji.replace_unified(user.display_name || user.displayName) + ' </div>')
                .append($('<div class="username">(' + user.username + ')</div>')
                    .click(switchSection.bind(null, 'User', id)))
                .contextmenu(function (ev) {
                    ev.preventDefault();
                    var contextmenu = $('<div class="contextmenu" style="top: ' + ev.pageY + 'px; left: ' + ev.pageX + 'px;"/>')
                        .append($('<div>Follow</div>').click(function () {
                            Api('follow', {
                                user_id: id
                            });
                        }))
                        .append($('<div>Unfollow</div>').click(function () {
                            Api('unfollow', {
                                user_id: id
                            });
                        }))
                        .append('<div data-clipboard-text="https://periscope.tv/' + user.username + '">Copy profile URL</div>' +
                                '<div data-clipboard-text="' + id + '">Copy user ID</div>')
                        .append($('<div>Block user</div>').click(function () {
                            Api('block/add', {
                                to: id
                            });
                        }))
                        .append($('<div>Unlock user</div>').click(function () {
                            Api('block/remove', {
                                to: id
                            });
                        }))
                        .click(function (event) {
                            $(this).remove();
                        })
                        .mousedown(function (event) {
                            event.stopPropagation();
                        });
                    $(document.body).append(contextmenu).off('mousedown').mousedown(function () {
                        contextmenu.remove();
                    });
                    new Clipboard('.contextmenu div');
                })
            );
    }
    function userlistRemove(user){
        var id = user.id || user.remoteID || user.user_id;
        userlist.find('#'+id).remove();
    }
    function renderMessages(event, container) {
        if (event.occupants) {  // "presense" for websockets
            userlist.empty();
            var user;
            for (var j in event.occupants)
                if ((user = event.occupants[j]) && user.display_name) {
                    userlistAdd(user);
                }
        }
        else
        switch (event.type) {
            case 1:  // text message
                var date = new Date((parseInt(event.ntpForLiveFrame.toString(16).substr(0, 8), 16) - 2208988800) * 1000);
                if ($.isArray(container)) {   // for subtitles
                    for (var i = 0; i < event.body.length; i++) // remove emoji surrogates
                        if (String.fromCodePoint(event.body.codePointAt(i)).length == 2) {
                            event.body = event.body.slice(0, i) + event.body.slice(i + 2);
                            i--;
                        }
                    container.push({
                        date: date,
                        user: event.username,
                        text: event.body
                    });
                } else {
                    var html = $('<div/>').append('[' + zeros(date.getHours()) + ':' + zeros(date.getMinutes()) + ':' + zeros(date.getSeconds()) + '] ');
                    var username = $('<span class="user">&lt;' + event.username + '&gt;</span>');
                    username.click(function () { // insert username to text field
                        textBox.val(textBox.val() + '@' + $(this).text().substr(1, $(this).text().length - 2) + ' ');
                        textBox.focus();
                    });
                    html.append(username, ' ', emoji.replace_unified($('<div/>').text(event.body).html()).replace(/(@\S+)/g, '<b>$1</b>'));
                    if (!event.body)    // for debug
                        console.log('empty body!', event);
                    container.append(html);
                }
                break;
            case 2: // heart
                /*moderationReportType: 0
                moderationType: 0*/
                break;
            case 3: // "joined"
                if (event.displayName && !$.isArray(container))
                    userlistAdd(event);
                break;
            case 4: // broadcaster moved to new place
                if ($('#debug')[0].checked && !$.isArray(container))
                    console.log('new location: ' + event.lat + ', ' + event.lng + ', ' + event.heading);
                break;
            case 5: // broadcast ended
                if (!$.isArray(container))
                    container.append('<div class="service">*** ' + (event.displayName || 'Broadcaster') + (event.username ? ' (@' + event.username + ')' : '') + ' ended the broadcast</div>');
                break;
            case 6: // followers invited
                if (!$.isArray(container))
                    container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + '): ' + event.body.replace('*%s*', event.invited_count) + '</div>');
                break;
            case 7: // BROADCAST_STARTED_LOCALLY (?)
                if (!$.isArray(container)) {
                    container.append('<div class="service">*** Broadcast started locally</div>');
                    console.log('BROADCAST_STARTED_LOCALLY', event);
                }
                break;
            case 8: // replay available
                break;
            case 9: // Broadcaster starts streaming. uuid=SE-0. timestampPlaybackOffset
                break;
            case 10: //LOCAL_PROMPT_TO_FOLLOW_BROADCASTER (?)
                if (!$.isArray(container)) {
                    container.append('<div class="service">*** LOCAL_PROMPT_TO_FOLLOW_BROADCASTER</div>');
                    console.log('LOCAL_PROMPT_TO_FOLLOW_BROADCASTER', event);
                }
                break;
            case 11: //LOCAL_PROMPT_TO_SHARE_BROADCAST (?)
                if (!$.isArray(container)) {
                    container.append('<div class="service">*** LOCAL_PROMPT_TO_SHARE_BROADCAST</div>');
                    console.log('LOCAL_PROMPT_TO_SHARE_BROADCAST', event);
                }
                break;
            case 12: // Ban
            case 14: //SUBSCRIBER_BLOCKED_VIEWER
                if ($.isArray(container))
                    container.push({
                        date: date,
                        user: '',
                        text: '@' + event.broadcasterBlockedUsername + ' has been blocked for message: "' + event.broadcasterBlockedMessageBody +'"'
                    });
                else
                    container.append('<div class="service">*** @' + event.broadcasterBlockedUsername + ' has been blocked for message: "' + event.broadcasterBlockedMessageBody + '"</div>');
                break;
            case 13: //SUBSCRIBER_SHARED_ON_TWITTER
                if (!$.isArray(container))
                    container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + ') shared on twitter</div>');
                break;
            case 15: //SUBSCRIBER_SHARED_ON_FACEBOOK
                if (!$.isArray(container))
                    container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + ') shared on facebook</div>');
                break;
            case 16: //SCREENSHOT
                if (!$.isArray(container))
                    container.append('<div class="service">*** ' + (event.displayName || '') + (event.username ? ' (@' + event.username + ')':'')+' has made the screenshot</div>');
                break;
            default: // service messages (event.action = join, leave, timeout, state_changed)
                if ($('#debug')[0].checked)
                    console.log('renderMessages default!', event);
                /*event.occupancy && event.total_participants*/
                break;
        }
    }
    function processWSmessage (message, div) {
        message.payload = JSON.parse(message.payload);
        message.body = $.extend(JSON.parse(message.payload.body), message.payload.sender);
        if ($('#autoscroll')[0].checked)
            chat[0].scrollTop = chat[0].scrollHeight;
        switch (message.kind) {
            case MESSAGE_KIND.CHAT:
                renderMessages(message.body, div);
                break;
            case MESSAGE_KIND.CONTROL:
                switch (message.payload.kind) {
                    case  MESSAGE_KIND.PRESENCE:
                        $('#presence').text(message.body.occupancy + '/' + message.body.total_participants);
                        break;
                    case MESSAGE_KIND.CHAT: // smb joined
                        userlistAdd(message.body); // message.payload.cap
                        break;
                    case MESSAGE_KIND.CONTROL: // smb left
                        userlistRemove(message.body); //message.payload.of
                        break;
                    default:
                        console.log(message);
                }
                break;
            default:
                console.log('default!', message);
        }
    }
    var playButton = $('<a class="button" id="startchat">OK</a>').click(function () {
        clearInterval(chat_interval);
        if (NODEJS && ws && ws.readyState == ws.OPEN)
            ws.pause(); // close() doesn't close :-/
        chat.empty();
        userlist.empty();
        title.empty();
        historyDiv.empty();
         //Load user list
        Api('getBroadcastViewers', {
            broadcast_id: broadcast_id.val().trim()
        }, function(viewers){
            userlist.empty();
            var user;
            for (var j in viewers.live)
                if ((user = viewers.live[j]) && user.display_name) {
                    userlistAdd(user);
                }
        });
        Api('accessChannel', {
            broadcast_id: broadcast_id.val().trim()
        }, function (broadcast) {
            var userLink = $('<a class="username">(@' + broadcast.broadcast.username + ')</a>').click(switchSection.bind(null, 'User', broadcast.broadcast.user_id));
            var srtLink = $('<a>SRT</a>').click(function () {
                Progress.start();
                var data = [];
                historyLoad('', data, function(){
                    data.sort(function (a, b) { return a.date - b.date; });
                    var start = new Date(broadcast.broadcast.start);
                    var srt = '';
                    for (var i = 0; i < data.length; i++) {
                        var date0 = new Date(data[i].date - start); // date of the current message
                        var date1 = new Date((i < data.length - 1 ? data[i + 1].date : new Date(broadcast.broadcast.end || new Date())) - start); // date of the next message
                        srt += (i + 1) + '\n' +
                            zeros(date0.getUTCHours()) + ':' + zeros(date0.getMinutes()) + ':' + zeros(date0.getSeconds()) + ','+date0.getMilliseconds()+' --> ' +
                            zeros(date1.getUTCHours()) + ':' + zeros(date1.getMinutes()) + ':' + zeros(date1.getSeconds()) + ','+date1.getMilliseconds()+'\n' +
                            (i > 3 ? '<b>' + data[i - 4].user + '</b>: ' + data[i - 4].text + '\n' : '') +
                            (i > 2 ? '<b>' + data[i - 3].user + '</b>: ' + data[i - 3].text + '\n' : '') +
                            (i > 1 ? '<b>' + data[i - 2].user + '</b>: ' + data[i - 2].text + '\n' : '') +
                            (i > 0 ? '<b>' + data[i - 1].user + '</b>: ' + data[i - 1].text + '\n' : '') +
                            '<b>' + data[i].user + '</b>: ' + data[i].text + '\n\n';
                    }
                    var filename = (broadcast.broadcast.status || 'Untitled') + '.srt';
                    srtLink.unbind('click')
                        .click(saveAs.bind(null, srt, filename))
                        .attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(srt))
                        .attr('download', filename)
                        .get(0).click();
                });
            });
            title.html((broadcast.read_only?'Read-only | ':'') + '<a href="https://www.periscope.tv/w/' + broadcast.broadcast.id + '" target="_blank">' + emoji.replace_unified(broadcast.broadcast.status || 'Untitled') + '</a> | '
                + emoji.replace_unified(broadcast.broadcast.user_display_name) + ' ')
                .append(userLink,
                    broadcast.hls_url ? ' | <a href="' + broadcast.hls_url + '">M3U Link</a>' : '',
                    broadcast.replay_url ? ' | <a href="' + broadcast.replay_url + '">Replay Link</a>' : '',
                    broadcast.rtmp_url ? ' | <a href="' + broadcast.rtmp_url + '">RTMP Link</a>' : '',
                    ' | ', srtLink
                );
            // Load history
            function historyLoad(start, container, callback) {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: broadcast.endpoint + '/chatapi/v1/history',
                    data: JSON.stringify({
                        access_token: broadcast.access_token,
                        cursor: start,
                        duration: 100 // actually 40 is maximum
                    }),
                    onload: function (history) {
                        if (history.status == 200) {
                            history = JSON.parse(history.responseText);
                            for (var i in history.messages)
                                processWSmessage(history.messages[i], container || historyDiv);
                            if (history.cursor != '')
                                historyLoad(history.cursor, container, callback);
                            else {
                                Progress.stop();
                                if (Object.prototype.toString.call(callback) === '[object Function]')
                                    callback();
                            }
                        } else {
                            Progress.stop();
                            if (Object.prototype.toString.call(callback) === '[object Function]')
                                callback();
                        }
                    }
                });
            }
            chat.append(historyDiv, $('<center><a>Load history</a></center>').click(function () {
                Progress.start();
                historyLoad('');
                $(this).remove();
            }));
            if (broadcast.read_only)
                switch (broadcast.type) {
                    case "StreamTypeOnlyFriends":
                        chat.append('<div class="error">*** This chat is for friends only!</div>');
                        break;
                    default:
                        chat.append('<div class="error">*** Chatroom is full! You in read only mode!</div>');
                }
            // Chat reading & posting
            if (NODEJS) {
                var openSocket = function (failures) {
                    ws = new WebSocket(broadcast.endpoint.replace('https:', 'wss:').replace('http:', 'ws:') + '/chatapi/v1/chatnow');

                    ws.on('open', function open() {
                        // AUTH
                        ws.send(JSON.stringify({
                            payload: JSON.stringify({access_token: broadcast.access_token}),
                            kind: MESSAGE_KIND.AUTH
                        }));
                        // JOIN
                        ws.send(JSON.stringify({
                            payload: JSON.stringify({
                                body: JSON.stringify({
                                    room: broadcast.room_id
                                }),
                                kind: MESSAGE_KIND.CHAT
                            }),
                            kind: MESSAGE_KIND.CONTROL
                        }));
                    });

                    ws.on('ping', function (data) {
                        ws.pong(data, {masked: false, binary: true});
                    });

                    ws.on('message', function (data) {
                        processWSmessage(JSON.parse(data), chat);
                    });

                    ws.on('close', function (code) {
                        ws.close();
                        switch (code) {
                            case 403:   // 403=forbidden
                                console.log('Forbidden');
                                break;
                            case 1006:  // 1006=timeout
                                if (failures < 4) {
                                    setTimeout(openSocket.bind(null, failures + 1), 100);
                                    console.log('reconnect ' + failures);
                                }
                                break;
                            case 1000:  // 1000=broadcast ended
                                break;
                            default:
                                console.log('websocket closed, code: ', code);
                        }
                    });
                };

                var sendMessage = function (customtype) {
                    var timestamp = Math.floor(Date.now() / 1000);
                    var ntpstamp = parseInt((timestamp + 2208988800).toString(16) + '00000000', 16); // timestamp in NTP format
                    var message = {
                        body: textBox.val(),
                        //display_name: 'OpenPeriscope',
                        //initials: '',
                        //"moderationReportType": 0,
                        //"moderationType": 0,
                        //v: 2
                        profileImageURL: loginTwitter.user.profile_image_urls[0].url,
                        timestamp: timestamp,
                        remoteID: loginTwitter.user.id,
                        username: loginTwitter.user.username,
                        uuid: "OpenPeriscope" + (Math.random()+'').replace('.',''),
                        signer_token: broadcast.signer_token,
                        participant_index: broadcast.participant_index,
                        type: customtype || 1,    // "text message"
                        ntpForBroadcasterFrame: ntpstamp,
                        ntpForLiveFrame: ntpstamp
                    };
                    ws.send(JSON.stringify({
                        payload: JSON.stringify({
                            body: JSON.stringify(message),
                            room: broadcast.room_id,
                            timestamp: timestamp
                            //sender
                        }),
                        kind: MESSAGE_KIND.CHAT
                    }), function (error) {
                        textBox.val('');
                        if (error)
                            console.log('message not sent', error);
                        else
                            renderMessages(message, chat);
                    });
                };
                if (broadcast.endpoint)
                    openSocket(0);
            } else {
                if (broadcast.endpoint) {
                    var cursor = null;
                    clearInterval(chat_interval);
                    var prevMessages = [];
                    chat_interval = setInterval(function () {
                        GM_xmlhttpRequest({
                            method: 'POST',
                            url: broadcast.endpoint + '/chatapi/v1/history',
                            data: JSON.stringify({
                                access_token: broadcast.access_token,
                                cursor: cursor || (Date.now() - 30000) * 1000000 + '',
                                limit: 1000
                            }),
                            onload: function (history) {
                                if (history.status == 200) {
                                    history = JSON.parse(history.responseText);
                                    for (var i in history.messages) {
                                        var contains = false;
                                        for (var j = 0; j < prevMessages.length && !contains; j++) // if prevMessages contains meesage
                                            if (prevMessages[j].signature == history.messages[i].signature)
                                                contains = true;
                                        if (!contains)
                                            processWSmessage(history.messages[i], chat);
                                    }
                                    prevMessages = history.messages;
                                    cursor = history.cursor;
                                }
                            }
                        });
                    }, 1000);
                }
                var sendMessage = function () {
                    alert('Sending messages available only in standalone version');
                };
            }
            $('#sendMessage').off().click(sendMessage.bind(null, null));
            $('#sendLike').off().click(sendMessage.bind(null, 2));
            textBox.off().keypress(function (e) {
                if (e.which == 13) {
                    sendMessage();
                    return false;
                }
            });
        }, function (error) {
            title.append('<b>' + error + '</b>');
        });
    });
    $('#right').append(
        $('<div id="Chat"/>').append(
            broadcast_id, playButton, title, '<br/><div id="presence" title="watching/maximum"/>', userlist, chat, $('<div id="underchat">').append(
                '<label class="right"><input type="checkbox" id="autoscroll" checked/> Autoscroll</label>',
                '<a class="button right" id="sendLike">\u2665</a><a class="button right" id="sendMessage">Send</a>', $('<div/>').append(textBox)
            )
        )
    );
},
User: function () {
    var resultUser = $('<div id="resultUser" />');
    var showButton = $('<a class="button" id="showuser">OK</a>').click(function () {
        resultUser.empty();
        var id =  $('#user_id').val().trim();
        Api('user', {
            user_id: id
        }, function (response) {
            resultUser.prepend(getUserDescription(response.user));
            FollowersSpoiler.append(' (' + response.user.n_followers + ')');
            FollowingSpoiler.append(' (' + response.user.n_following + ')');
        });
        Api('userBroadcasts', {
            user_id: id,
            all: true
        }, function (broadcasts) {
            refreshList($('#userBroadcasts'))(broadcasts);
            BroadcastsSpoiler.append(' (' + broadcasts.length + ')').click();
        });
        var BroadcastsSpoiler = $('<div class="spoiler menu" data-spoiler-link="broadcasts">Broadcasts</div>');
        var FollowersSpoiler = $('<div class="spoiler menu" data-spoiler-link="followers">Followers</div>').on("jq-spoiler-visible", function() {
            var followersDiv = $('#userFollowers');
            if (!followersDiv.html())
                Api('followers', {
                    user_id: id
                }, function (followers) {
                    if (followers.length)
                        for (var i in followers)
                            followersDiv.append($('<div class="card"/>').append(getUserDescription(followers[i])));
                    else
                        followersDiv.html('No results');
                });
        });
        var FollowingSpoiler = $('<div class="spoiler menu" data-spoiler-link="following">Following</div>').on("jq-spoiler-visible", function() {
            var followingDiv = $('#userFollowing');
            if (!followingDiv.html())
                Api('following', {
                    user_id: id
                }, function (following) {
                    if (following.length)
                        for (var i in following)
                            followingDiv.append($('<div class="card"/>').append(getUserDescription(following[i])));
                    else
                        followingDiv.html('No results');
                });
        });
        resultUser.append(BroadcastsSpoiler, '<div class="spoiler-content" data-spoiler-link="broadcasts" id="userBroadcasts" />',
            FollowersSpoiler, '<div class="spoiler-content" data-spoiler-link="followers" id="userFollowers" />',
            FollowingSpoiler, '<div class="spoiler-content" data-spoiler-link="following" id="userFollowing" />');
        if (id == loginTwitter.user.id) {   // Blocked list
            var BlockedSpoiler = $('<div class="spoiler menu" data-spoiler-link="blocked">Blocked</div>').on("jq-spoiler-visible", function() {
                var blockedDiv = $('#userBlocked');
                if (!blockedDiv.html())
                    Api('block/users', {}, function (blocked) {
                        if (blocked.length)
                            for (var i in blocked) {
                                blocked[i].is_blocked = true;
                                blockedDiv.append($('<div class="card"/>').append(getUserDescription(blocked[i])));
                            }
                        else
                            blockedDiv.html('No results');
                    });
            });
            resultUser.append(BlockedSpoiler, '<div class="spoiler-content" data-spoiler-link="blocked" id="userBlocked" />');
        }
        $(".spoiler").spoiler({ triggerEvents: true });
    });
    $('#right').append($('<div id="User">id: <input id="user_id" type="text" size="15"></div>').append(showButton, '<br/><br/>', resultUser));
},
People: function () {
    var refreshButton = $('<a class="button">Refresh</a>').click(function () {
        Api('suggestedPeople', {
            languages: [$('#People .lang').val()]
        }, function (response) {
            var result = $('#resultPeople');
            result.empty();
            if (response.featured && response.featured.length) {
                result.append('<h1>Featured</h1>');
                for (var i in response.featured)
                    result.append($('<div class="card"/>').append(getUserDescription(response.featured[i])));
            }
            result.append('<h1>Popular</h1>');
            for (i in response.popular)
                result.append($('<div class="card"/>').append(getUserDescription(response.popular[i])));
            Api('suggestedPeople', {}, function (response) {
                if (response.hearted && response.hearted.length) {
                    result.append('<h1>Hearted</h1>');
                    for (var i in response.hearted)
                        result.append($('<div class="card"/>').append(getUserDescription(response.hearted[i])));
                }
            });
        });
    });
    var searchPeople = function () {
        Api('userSearch', {
            search: $('#search').val()
        }, function (response) {
            var result = $('#resultPeople');
            result.html('<h1>Search results</h1>');
            var found_exact = false;
            for (var i in response) {
                result.append($('<div class="card"/>').append(getUserDescription(response[i])));
                if (!found_exact && response[i].username.toUpperCase() == $('#search').val().toUpperCase())
                    found_exact=true;
            }
            if (!found_exact)
                Api('user', {
                    username: $('#search').val()
                }, function (user) {
                    result.prepend($('<div class="card"/>').append(getUserDescription(user.user)));
                });
        });
    };
    var searchButton = $('<a class="button">Search</a>').click(searchPeople);
    $('#right').append($('<div id="People"/>').append(languageSelect, refreshButton, $('<input id="search" type="text">').keypress(function (e) {
        if (e.which == 13) {
            searchPeople();
            return false;
        }
    }), searchButton, '<div id="resultPeople" />'));
    $("#People .lang").find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
    refreshButton.click();
},
Edit: function () {
    var button = $('<a class="button">Save</a>').click(function () {
        var uname = $('#uname').val();
        if (uname != loginTwitter.user.username) {
            Api('verifyUsername', {
                username: uname,
                display_name: loginTwitter.user.display_name
            }, function () {
                loginTwitter.user.username = uname;
                localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            });
        }
        var description = $('#description').val();
        if (description != loginTwitter.user.description)
            Api('updateDescription', {
                description: description
            }, function () {
                loginTwitter.user.description = description;
                localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            });
        var dname = $('#dname').val();
        if (dname != loginTwitter.user.display_name) {
            Api('updateDisplayName', {
                display_name: dname
            }, function () {
                loginTwitter.user.display_name = dname;
                localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            });
        }
        if ($('input[name="image"]').val())
            form.submit();
    });
    var form = $('<form target="foravatar" action="https://api.periscope.tv/api/v2/uploadProfileImage" enctype="multipart/form-data" method="post">' +
        '<input name="image" type="file" accept="image/jpeg,image/png,image/gif">' +
        '<input name="cookie" type="hidden" value="'+loginTwitter.cookie+'"></form>');
    var hiddenIframe = $('<iframe id="foravatar" name="foravatar" style="display: none;"/>').on('load',refreshProfile);

    var settingsContainer = $('<div/>');
    var tempSettings;
    Api('getSettings', {}, function (settingsResponse) {
        loginTwitter.settings = settingsResponse;
        localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
        tempSettings = settingsResponse;
        for (var setting in loginTwitter.settings) {
            settingsContainer.append($('<label><input type="checkbox" ' + (loginTwitter.settings[setting] ? 'checked' : '') + '/> ' + setting + '</label><br/>').click(function (setting) {
                return function (e) {
                    tempSettings[setting] = e.target.checked;
                }
            }(setting)));
        }
    });
    var buttonSettings = $('<a class="button">Save</a>').click(function () {
        Api('setSettings', {
            settings: tempSettings
        }, function (r) {
            if (r.success){
                loginTwitter.settings = tempSettings;
                localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            } else
                alert('Settings not saved!');
        });
    });

    var notifications = $('<label><input type="checkbox" ' + (settings.followingNotifications ? 'checked' : '') + '/> Enable notifications</label>').click(function (e) {
        setSet('followingNotifications', e.target.checked);
        if (e.target.checked)
            Notifications.start();
        else
            Notifications.stop();
    });
    var notifications_interval = $('<input type="number" min="2" value="' + (settings.followingInterval || Notifications.default_interval) + '">').change(function () {
        setSet('followingInterval', this.value);
        Notifications.stop();
        Notifications.start();
    });

    if (NODEJS) {
        var autoDownload = $('<label><input type="checkbox" ' + (settings.automaticDownload ? 'checked' : '') + '/> Enable automatic downloading of the following items</label>').click(function (e) {
            setSet('automaticDownload', e.target.checked);
            if (e.target.checked)
                Notifications.start();
            else
                Notifications.stop();
        });
        var download_private = $('<label><input type="checkbox" style="margin-left: 1.5em;" ' + (settings.privateDownload ? 'checked' : '') + '/> Private broadcasts</label>').click(function (e) {
            setSet('privateDownload', e.target.checked);
        });
        var download_following = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.followingDownload ? 'checked' : '') + '/> Following broadcasts</label>').click(function (e) {
            setSet('followingDownload', e.target.checked);
        });
        var download_shared = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.sharedDownload ? 'checked' : '') + '/> Shared broadcasts</label>').click(function (e) {
            setSet('sharedDownload', e.target.checked);
        });
        var current_download_path = $('<dt style="margin-right: 10px;">' + settings.downloadPath + '</dt>');
        var download_path = $('<dt/>').append($('<input type="file" webkitdirectory directory/>').change(function () {
            setSet('downloadPath', $(this).val());
            current_download_path.text($(this).val());
        }));
        var download_format = $('<dt/>').append($('<select>' +
            '<option value="mp4" '+(settings.downloadFormat=='mp4'?'selected':'')+'>MP4</option>' +
            '<option value="ts" '+(settings.downloadFormat=='ts'?'selected':'')+'>TS</option>' +
            '</select>').change(function () {
            setSet('downloadFormat', $(this).val());
        }));
    }

    $('#right').append($('<div id="Edit"/>').append(
        '<h3>Profile edit</h3>',
        '<dt>Display name:</dt><input id="dname" type="text" value="' + loginTwitter.user.display_name + '"><br/>' +
        '<dt>Username:</dt><input id="uname" type="text" value="' + loginTwitter.user.username + '"><br/>' +
        '<dt>Description:</dt><input id="description" type="text" value="' + loginTwitter.user.description + '"><br/>' +
        '<dt>Avatar:</dt>', hiddenIframe, form, '<br/><br/>',
        button, '<br><hr color="#E0E0E0" size="1">',
        '<h3>Periscope settings</h3>',
        settingsContainer, buttonSettings,
        '<hr color="#E0E0E0" size="1">' +
        '<h3>OpenPeriscope settings</h3>',
        notifications , '<br><br>',
        autoDownload, '<br>',
        download_private, '<br>',
        download_following, '<br>',
        download_shared, '<br><br>',
        'Notifications refresh interval: ', notifications_interval ,' seconds','<br/><br/>',
        (NODEJS ? ['<dt>Downloads path:</dt>', current_download_path, download_path, '<br/><br/>',
                   '<dt>Download format:</dt>', download_format] : '')
    ));
},
Console: function () {
    var resultConsole = $('<pre id="resultConsole" />');
    var downloadButton = $('<a class="button" id="download">Download</a>').click(function () {
        resultConsole.empty();
        var dl = download($('#download_name').val().trim(), $('#download_url').val().trim(), $('#download_cookies').val().trim().split('&'), $('#download_userid').val().trim(), $('#download_username').val().trim(), resultConsole);
        stopButton.show().unbind('click').click(function () {
            try {
                dl.stdin.end('q', dl.kill);
            } finally {
                $(this).hide();
                $('#download_userid').val(null);
                $('#download_username').val(null);
                downloadButton.show();
            }
        });
        var gui = require('nw.gui');
        gui.Window.get().removeAllListeners('close').on('close', function(){
            try {
                dl.stdin.end('q', dl.kill);
            } finally {
                gui.App.quit();
            }
        });
        $(this).hide();
    });
    var stopButton = $('<a class="button">Stop</a>').hide();
    $('#right').append($('<div id="Console"/>').append('<dt>URL:</dt><input id="download_url" type="text" size="45"><br/>' +
                                                       '<dt>Cookies:</dt><input id="download_cookies" type="text" size="45"><br/>' +
                                                       '<dt>Name:</dt><input id="download_name" type="text" size="45"><br/>' +
                                                       '<input id="download_userid" type="hidden">' +
                                                       '<input id="download_username" type="hidden">',
                                                        downloadButton, stopButton, '<br/><br/>', resultConsole));
}
};
var chat_interval;
var ws; // websocket
var MESSAGE_KIND = {
    CHAT: 1,
    CONTROL: 2,
    AUTH: 3,
    PRESENCE: 4
};
/* LEVEL 1 */
function cleanFilename(filename){
    var tmp = filename.replace(/[<>+\\/:"|?*]/g, '');
    if (tmp.length > 100)
        tmp = tmp.substring(0, 100);
    return tmp;
}
function zeros(number) {
    return (100 + number + '').substr(1);
}
function refreshList(jcontainer, title) {  // use it as callback arg
    return function (response) {
        jcontainer.html(title || '<div style="clear:both"/>');
        if (response.length) {
            jcontainer.prepend($('<a class="watching right icon">Sort by watching</a>').click(function () {  // sort cards in given jquery-container
                var cards = jcontainer.find('.card');
                var sorted = cards.sort(function (a, b) {
                    return $(b).find('.watching').text() - $(a).find('.watching').text();
                });
                jcontainer.append(sorted);
                $(window).trigger('scroll');    // for lazy load
            }));

            var ids = [];
            for (var i in response) {
                var stream = $('<div class="card ' + response[i].state + ' ' + response[i].id + '"/>').append(getDescription(response[i]));
                var link = $('<a>Get stream link</a>');
                link.click(getM3U.bind(null, response[i].id, stream));
                jcontainer.append(stream.append(link));
                ids.push(response[i].id);
            }
            if (typeof response[0].n_watching == 'undefined')
                Api('getBroadcasts', {
                    broadcast_ids: ids,
                    only_public_publish: true
                }, function (info) {
                    for (var i in info)
                        $('.card.' + info[i].id + ' .watching').text(info[i].n_watching);
                });
        } else
            jcontainer.append('No results');
        // if jcontainer isn't visible, scroll to it
        var top = jcontainer.offset().top;
        if ($(window).scrollTop() + $(window).height() - 100 < top) {
            $(window).scrollTop(top);
        }
    };
}
function getM3U(id, jcontainer) {
    jcontainer.find('.links').empty();
    getURL(id, function (hls_url, replay_url, cookies, _name, _user_id, _user_name) {
        var params = '';
        var ffmpeg_cookies = '';
        if (cookies && cookies.length) {
            for (var i in cookies) {
                params += cookies[i].Name.replace('CloudFront-', '') + '=' + cookies[i].Value + '; ';
                ffmpeg_cookies += cookies[i].Name + '=' + cookies[i].Value + '&';
            }
            params += 'Expires=0';
        }
        if (hls_url) {
            var clipboardLink = $('<a data-clipboard-text="' + hls_url + '">Copy URL</a>');
            jcontainer.find('.links').append('<a href="' + hls_url + '">Live M3U link</a>',
                NODEJS ? [' | ', $('<a>Download</a>').click(switchSection.bind(null, 'Console', {url: hls_url, cookies: ffmpeg_cookies, name: _name, user_id: _user_id, user_name: _user_name}))] : '',
                ' | ', clipboardLink);
            new Clipboard(clipboardLink.get(0));
        }
        if (replay_url) {
            var replay_base_url = replay_url.replace(/playlist.*m3u8/ig, '');
            GM_xmlhttpRequest({
                method: 'GET',
                url: replay_url,
                headers: {
                    Cookie: params
                },
                onload: function (m3u_text) {
                    m3u_text = m3u_text.responseText.replace(/(chunk_\d+\.ts)/g, replay_base_url + '$1');
                    var filename = 'playlist.m3u8';
                    var link = $('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(m3u_text) + '" download="' + filename + '">Download replay M3U</a>').click(saveAs.bind(null, m3u_text, filename));
                    var clipboardLink = $('<a data-clipboard-text="' + replay_url + '">Copy URL</a>');
                    jcontainer.find('.links').append(link,
                        NODEJS ? [' | ', $('<a>Download</a>').click(switchSection.bind(null, 'Console', {url: replay_url, cookies: ffmpeg_cookies, name: _name, user_id: _user_id, user_name: _user_name}))] : '',
                        ' | ', clipboardLink);
                    new Clipboard(clipboardLink.get(0));
                }
            });
        }
    });
}
/**
 * @callback getURLCallback
 * @param {String} hls_url
 * @param {String} replay_url
 * @param {Array} cookies
 * @param {String} name
 * @param {String} user_id
 * @param {String} user_name
 */

/**
 *
 * @param {String} id - broadcast ID
 * @param {getURLCallback} callback - function applied against result
 */
function getURL(id, callback){
    var getURLCallback =function (r) {
        var date_created = new Date(r.broadcast.start);
        var date_created_str = date_created.getFullYear() + '-' + zeros(date_created.getMonth() + 1) + '-' + zeros(date_created.getDate()) + '_' + zeros(date_created.getHours()) + '.' + zeros(date_created.getMinutes());
        var name = cleanFilename(date_created_str + '_' + r.broadcast.user_display_name + '_'+r.broadcast.status);
        // For live
        var hls_url = r.hls_url || r.https_hls_url || r.lhls_url;
        if (hls_url) {
            callback(hls_url, null, r.cookies, name, r.broadcast.user_id, r.broadcast.username);
        }
        // For replay
        var replay_url = r.replay_url;
        if (replay_url) {
            callback(null, replay_url, r.cookies, name, r.broadcast.user_id, r.broadcast.username);
        }
    };
    Api('accessVideoPublic', {
        broadcast_id: id
    }, getURLCallback, function(){
        Api('accessChannel', {  // private video case
            broadcast_id: id
        }, getURLCallback)
    });
}
function download(name, url, cookies, user_id, user_name, jcontainer) { // cookies=['key=val','key=val']
    function _arrayBufferToString(buf, callback) {
        var bb = new Blob([new Uint8Array(buf)]);
        var f = new FileReader();
        f.onload = function (e) {
            callback(e.target.result);
        };
        f.readAsText(bb);
    }

    var windows = process.platform === 'win32',
        folder_separator = windows ? '\\' : '/';

    var output_dir = settings.downloadPath + folder_separator

    if (user_id && user_name)
        output_dir += user_id + ' (' + user_name + ')' + folder_separator;

    const fs = require('fs');
    try {
        fs.mkdirSync(output_dir);
    } catch (e) {}

    var ff_cookies = '';
    if (cookies)
        for (var i in cookies)
            if (cookies[i].length)
                ff_cookies += cookies[i] + '; path=/; domain=periscope.tv\n';
    try {   // for executing from .nw
        fs.chmodSync('ffmpeg', 0777);
    } catch (e) {}
    const spawn = require('child_process').spawn((windows ? '' : './') + 'ffmpeg', [
        '-loglevel', ($('#debug')[0].checked ? 'debug' : 'warning'),
        '-cookies', ff_cookies,
        '-i', url,
        '-c', 'copy',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        (settings.downloadFormat != 'ts' ? '-bsf:a' : '-f'), (settings.downloadFormat != 'ts' ? 'aac_adtstoasc' : 'mpegts'),
        '-y',
        output_dir + name + '.' + (settings.downloadFormat || 'mp4')
    ]);
    if (jcontainer) {
        if (!spawn.pid)
            jcontainer.append('FFMpeg not found. On Windows, place the static build into OpenPeriscope directory.');

        spawn.stdout.on('data', function (data) {
            _arrayBufferToString(data, function (d) {
                jcontainer.append(d);
            });
        });

        spawn.stderr.on('data', function (data) {
            _arrayBufferToString(data, function (d) {
                jcontainer.append(d);
            });
        });

        spawn.on('error', function (code) {
            _arrayBufferToString(code, function (d) {
                console.log('error: ', d);
            });
        });

        // $(window).keydown(function(event){
        //     spawn.stdin.write(String.fromCharCode(event.keyCode)+'\r\n');
        //     //spawn.stdin.close();
        // });
    } else {
        if (spawn.pid) {
            ffLog = "";
            function writeToLog(data) {
                _arrayBufferToString(data, function (d) {
                    ffLog += d;
                });
            }
            spawn.stdout.on('data', writeToLog);
            spawn.stderr.on('data', writeToLog);
            spawn.on('close', function (code, signal) {
                ffLog+="\nClose: code "+code+", signal "+signal;
            });
            spawn.on('error', writeToLog.bind("disconnected"));
            spawn.on('disconnect', writeToLog);
            spawn.on('exit', function (code, signal) {
                ffLog+="\nExit: code "+code+", signal "+signal;
            });
        }
    }
    return spawn;
}
function saveAs(data, filename) {
    if (NODEJS) {
        $('<input type="file" nwsaveas="' + filename + '" />').change(function () {
            const fs = require('fs');
            fs.writeFile($(this).val(), data);
        }).click();
    }
}
function getDescription(stream) {
    var title = emoji.replace_unified(stream.status || 'Untitled');
    var featured_reason = '';
    if (stream.featured) {
        title += '<span class="featured" style="background: ' + (stream.featured_category_color || '#FFBD00') + '">' + (stream.featured_category || 'POPULAR') + '</span>';
        if (stream.featured_reason)
            featured_reason = ' <i>'+stream.featured_reason+'</i>';
    }
    var date_created = new Date(stream.created_at);
    var duration = stream.end || stream.timedout ? new Date(new Date(stream.end || stream.timedout) - date_created) : 0;
    var userLink = $('<a class="username">' + emoji.replace_unified(stream.user_display_name) + ' (@' + stream.username + ')</a>');
    userLink.click(switchSection.bind(null, 'User', stream.user_id));
    var sharedByLink = (stream.share_display_names ?  $('<a class="sharedByUsername">'+ emoji.replace_unified(stream.share_display_names[0]) + '</a>').click(switchSection.bind(null, 'User', stream.share_user_ids[0])) : '');
    if (stream.user_id == loginTwitter.user.id)
        var deleteLink = $('<a class="delete right icon" title="Delete"/>').click(function () {
            Api('deleteBroadcast', {broadcast_id: stream.id}, function (resp) {
                if (resp.success)
                    description.parent().remove();
            });
        });
    var screenlistLink = $('<a class="screenlist right icon">Screenlist</a>').click(function () {
        Api('replayThumbnailPlaylist', {
            broadcast_id: stream.id
        }, function (thumbs) {
            var html = '<html><head><title>'+(stream.status || 'Untitled')+' [OpenPeriscope]</title></head><body>';
            for (var i in thumbs.chunks) {
                html+='<img src="' + thumbs.chunks[i].tn + '"/>';
            }
            html+='</body></html>';
            window.open('data:text/html;charset=utf-8,'+encodeURIComponent(html));
        });
    });
    var chatLink = $('<a class="chatlink right icon">Chat</a>').click(switchSection.bind(null, 'Chat', stream.id));
    var description = $('<div class="description">\
                <a href="' + stream.image_url + '" target="_blank"><img lazysrc="' + stream.image_url_small + '"/>' + (stream.is_locked ? '<img src="' + IMG_PATH + '/images/lock-white.png" class="lock"/>' : '') + '</a>\
                <div class="watching right icon" title="Watching">' + (stream.n_watching || stream.n_web_watching || stream.n_total_watching || stream.n_total_watched || 0) + '</div>\
                <a target="_blank" href="https://www.periscope.tv/w/' + stream.id + '">' + title + '</a>'+featured_reason+'\
            </div>')
        .append(deleteLink, '<br/>', screenlistLink, userLink, (sharedByLink? ', shared by ' : ''), sharedByLink, (stream.channel_name ? ', on: ' + emoji.replace_unified(stream.channel_name) : ''), '<br/>', chatLink,
            '<span class="date icon" title="Created">' + zeros(date_created.getDate()) + '.' + zeros(date_created.getMonth() + 1) + '.' + date_created.getFullYear() + ' ' + zeros(date_created.getHours()) + ':' + zeros(date_created.getMinutes()) + '</span>'
            + (duration ? '<span class="time icon" title="Duration">' + zeros(duration.getUTCHours()) + ':' + zeros(duration.getMinutes()) + ':' + zeros(duration.getSeconds()) + '</span>' : '')
            + (stream.friend_chat ? '<span class="friend_chat" title="Chat only for friends"/>' : '')
            + (stream.is_locked ? '<span class="is_locked" title="Locked"/>' : ''),
            (stream.has_location ? $('<br/><span style="cursor:pointer;">' + stream.country + ', ' + stream.city + '</span>').click(switchSection.bind(null, 'Map', stream.ip_lat + ',' + stream.ip_lng)) : ''), '<div class="links" />');
    return description[0];
}
function getUserDescription(user) {
    user.profile_image_urls.sort(function (a, b) {
        return a.width * a.height - b.width * b.height;
    });
    var verified_icon = user.is_twitter_verified ? ' <svg class="right" title="Verified" viewBox="0 0 17 17" height="1em" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-767.000000, -573.000000)"><g transform="translate(-80.000000, -57.000000)"><g transform="translate(100.000000, 77.000000)"><g transform="translate(400.000000, 401.000000)"><g><g><g transform="translate(347.000000, 152.000000)"><path d="M1.74035847,11.2810213 C1.61434984,11.617947 1.54545455,11.982746 1.54545455,12.3636364 C1.54545455,14.0706983 2.92930168,15.4545455 4.63636364,15.4545455 C5.01725401,15.4545455 5.38205302,15.3856502 5.71897873,15.2596415 C6.22025271,16.2899361 7.2772042,17 8.5,17 C9.7227958,17 10.7797473,16.2899361 11.2810213,15.2596415 L11.2810213,15.2596415 C11.617947,15.3856502 11.982746,15.4545455 12.3636364,15.4545455 C14.0706983,15.4545455 15.4545455,14.0706983 15.4545455,12.3636364 C15.4545455,11.982746 15.3856502,11.617947 15.2596415,11.2810213 C16.2899361,10.7797473 17,9.7227958 17,8.5 C17,7.2772042 16.2899361,6.22025271 15.2596415,5.71897873 C15.3856502,5.38205302 15.4545455,5.01725401 15.4545455,4.63636364 C15.4545455,2.92930168 14.0706983,1.54545455 12.3636364,1.54545455 C11.982746,1.54545455 11.617947,1.61434984 11.2810213,1.74035847 C10.7797473,0.71006389 9.7227958,0 8.5,0 C7.2772042,0 6.22025272,0.71006389 5.71897873,1.74035847 C5.38205302,1.61434984 5.01725401,1.54545455 4.63636364,1.54545455 C2.92930168,1.54545455 1.54545455,2.92930168 1.54545455,4.63636364 C1.54545455,5.01725401 1.61434984,5.38205302 1.74035847,5.71897873 C0.71006389,6.22025272 0,7.2772042 0,8.5 C0,9.7227958 0.71006389,10.7797473 1.74035847,11.2810213 L1.74035847,11.2810213 Z" opacity="1" fill="#88C9F9"></path><path d="M11.2963464,5.28945679 L6.24739023,10.2894568 L7.63289664,10.2685106 L5.68185283,8.44985845 C5.27786241,8.07328153 4.64508754,8.09550457 4.26851062,8.499495 C3.8919337,8.90348543 3.91415674,9.53626029 4.31814717,9.91283721 L6.26919097,11.7314894 C6.66180802,12.0974647 7.27332289,12.0882198 7.65469737,11.7105432 L12.7036536,6.71054321 C13.0960757,6.32192607 13.0991603,5.68876861 12.7105432,5.29634643 C12.3219261,4.90392425 11.6887686,4.90083965 11.2963464,5.28945679 L11.2963464,5.28945679 Z" fill="#FFFFFF"></path></g></g></g></g></g></g></g></g></svg>' : '';
    return $('<div class="description"/>')
        .append((user.profile_image_urls.length ? '<a href="' + user.profile_image_urls[user.profile_image_urls.length - 1].url + '" target="_blank"><img class="avatar" width="128" lazysrc="' + user.profile_image_urls[0].url + '"></a>' : '<img class="avatar" width="128"/>')
        + '<div class="watching right icon" title="Followers">' + user.n_followers + '</div>'
        + (user.n_hearts ? '<div class="hearts right icon" title="hearts">' + user.n_hearts + '</div>' : '')
        + (user.twitter_screen_name ? '<a class="twitterlink right icon" title="Profile on Twitter" target="_blank" href="https://twitter.com/' + user.twitter_screen_name + '"><svg viewBox="0 0 16 14" height="1em" version="1.2"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-187.000000, -349.000000)" fill="#A4B8BE"><g transform="translate(187.000000, 349.000000)"><path d="M16,2.19685162 C15.4113025,2.4579292 14.7786532,2.63438042 14.1146348,2.71373958 C14.7924065,2.30746283 15.3128644,1.66416205 15.5579648,0.897667303 C14.9237353,1.27380396 14.2212078,1.5469961 13.4734994,1.69424362 C12.8746772,1.05626857 12.0215663,0.6576 11.0774498,0.6576 C9.26453784,0.6576 7.79475475,2.12732457 7.79475475,3.94011948 C7.79475475,4.19739297 7.8238414,4.44793615 7.87979078,4.68817903 C5.15161491,4.55129033 2.73285782,3.24443931 1.11383738,1.25847055 C0.83128132,1.74328711 0.669402685,2.30717021 0.669402685,2.90874306 C0.669402685,4.04757037 1.24897034,5.05231817 2.12976334,5.64095711 C1.591631,5.62392649 1.08551154,5.4762693 0.642891108,5.23040808 C0.64265701,5.2441028 0.64265701,5.25785604 0.64265701,5.27166782 C0.64265701,6.86212833 1.77416877,8.18887766 3.27584769,8.49039564 C3.00037309,8.56542399 2.71038443,8.60551324 2.41097333,8.60551324 C2.19946596,8.60551324 1.99381104,8.58497115 1.79342331,8.54663764 C2.21111233,9.85079653 3.42338783,10.7998291 4.85981199,10.8263406 C3.7363766,11.706724 2.32096273,12.2315127 0.783057171,12.2315127 C0.518116976,12.2315127 0.256805296,12.2160037 0,12.1856881 C1.45269395,13.1170462 3.17817038,13.6604458 5.0319324,13.6604458 C11.0697831,13.6604458 14.3714986,8.65853639 14.3714986,4.32076252 C14.3714986,4.17843105 14.3683383,4.0368604 14.3620176,3.89610909 C15.0033286,3.43329772 15.5598961,2.85513466 16,2.19685162" id="Fill-1" sketch:type="MSShapeGroup"></path></g></g></g></svg></a>' : '')
        + '<a class="periscopelink right icon" title="Profile on Periscope" target="_blank" href="https://periscope.tv/' + user.username + '"><svg version="1.1" height="1em" viewBox="0 0 113.583 145.426"><g><path fill="#A4B8BE" class="tofill" d="M113.583,56.791c0,42.229-45.414,88.635-56.791,88.635C45.416,145.426,0,99.02,0,56.791	C0,25.426,25.426,0,56.792,0C88.159,0,113.583,25.426,113.583,56.791z"/><path fill="#FFFFFF" d="M56.792,22.521c-2.731,0-5.384,0.327-7.931,0.928c4.619,2.265,7.807,6.998,7.807,12.489	c0,7.686-6.231,13.917-13.917,13.917c-7.399,0-13.433-5.779-13.874-13.067c-4.112,5.675-6.543,12.647-6.543,20.191	c0,19.031,15.427,34.458,34.458,34.458S91.25,76.01,91.25,56.979S75.823,22.521,56.792,22.521z"/></g></svg></a>')
        .append($('<div class="username">' + verified_icon + emoji.replace_unified(user.display_name) + ' (@' + user.username + ')</div>').click(switchSection.bind(null, 'User', user.id)))
        .append('Created: ' + (new Date(user.created_at)).toLocaleString()
        + (user.description ? '<div class="userdescription">' + emoji.replace_unified(user.description) +'</div>': '<br/>'))
        .append($('<a class="button'+ (user.is_following ? ' following' : ' follow') +'">' + (user.is_following ? 'unfollow' : 'follow') + '</a>').click(function () {
            var el = this;
            Api(el.innerHTML, { // follow or unfollow
                user_id: user.id
            }, function (r) {
                if (r.success)
                    el.innerHTML = el.innerHTML == 'follow' ? 'unfollow' : 'follow';
                    el.classList.contains("following")? el.setAttribute('class', 'button follow'):el.setAttribute('class', 'button following');
            })
        }))
        .append($('<a class="button">' + (user.is_blocked ? 'unblock' : 'block') + '</a>').click(function () {
            var el = this;
            Api(el.innerHTML == 'block' ? 'block/add' : 'block/remove', {
                to: user.id
            }, function (r) {
                if (r.success)
                    el.innerHTML = el.innerHTML == 'block' ? 'unblock' : 'block';
            })
        }))
        .append('<div style="clear:both"/>');
}
function setSet(key, value) {
    settings[key] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
}
function clearXHR() {   // abort all running XHR requests
    for (var i in XHR) {
        Progress.stop();
        XHR[i].abort();
    }
    XHR=[];
}
/* LEVEL 0 */
var XHR = [];
function Api(method, params, callback, callback_fail) {
    if (!params)
        params = {};
    if (loginTwitter && loginTwitter.cookie)
        params.cookie = loginTwitter.cookie;
    Progress.start();
    var xhrIndex = XHR.length;
    var req = GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.periscope.tv/api/v2/' + method,
        headers: {
            'User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)'
        },
        data: JSON.stringify(params),
        onload: function (r) {
            Progress.stop();
            XHR.splice(xhrIndex, 1);
            var response, debug = $('#debug').length && $('#debug')[0].checked;
            switch (r.status) {
                case 200:
                    try {
                        response = JSON.parse(r.responseText);
                    } catch (e) {
                        if (debug)
                            console.warn('JSON parse error:', e);
                    }
                    if (!!response && callback)
                        callback(response);
                    $(window).trigger('scroll');    // for lazy load
                    break;
                case 406:
                    alert(JSON.parse(r.responseText).errors[0].error);
                    break;
                case 401:
                    SignOut();
                    break;
                default:
                    response = 'API error: ' + r.status + ' ' + r.responseText;
                    if (callback_fail && Object.prototype.toString.call(callback_fail) === '[object Function]')
                        callback_fail(response);
            }
            if (debug)
                console.log('Method:', method, 'params:', params, 'response:', response);
        }
    });
    XHR.push(req);
}
function SignIn3(session_key, session_secret) {
    Api('loginTwitter', {
        "session_key": session_key,
        "session_secret": session_secret
    }, function (response) {
        localStorage.setItem('loginTwitter', JSON.stringify(response));
        loginTwitter = response;
        Ready(loginTwitter);
        if (!loginTwitter.user.username)    // User registration
            Api('verifyUsername', {
                username: loginTwitter.suggested_username,
                display_name: loginTwitter.user.display_name
            }, function (verified) {
                if (verified.success) {
                    loginTwitter.user = verified.user;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                } else
                    console.log('User verification failed!', verified);
            });
    })
}
function SignIn2(oauth_token, oauth_verifier) {
    OAuthTwitter('access_token', function (oauth) {
        localStorage.setItem('session_key', oauth.oauth_token);
        localStorage.setItem('session_secret', oauth.oauth_token_secret);
        session_key = oauth.oauth_token;
        session_secret = oauth.oauth_token_secret;
        SignIn3(session_key, session_secret);
    }, {oauth_token: oauth_token, oauth_verifier: oauth_verifier});
}
function SignIn1() {
    setSet('consumer_secret', $('#secret').val());
    if (settings.consumer_secret) {
        $(this).text('Loading...');
        OAuthTwitter('request_token', function (oauth) {
            location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauth.oauth_token;
        }, {oauth_callback: 'twittersdk://openperiscope/index.html'});
    }
}
function SignOut() {
    localStorage.clear();
    setSet();
    location.pathname = 'index.html';
}
function OAuthTwitter(endpoint, callback, extra){
    OAuth('https://api.twitter.com/oauth/' + endpoint, 'POST', callback,extra);
}
function OAuth(endpoint, _method, callback, extra) {
    var method = _method || 'POST';
    var url = endpoint;
    var params = {
        oauth_consumer_key: '9I4iINIyd0R01qEPEwT9IC6RE',
        oauth_nonce: Date.now(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Date.now() / 1000 | 0,
        oauth_version: '1.0'
    };
    for (var i in extra)
        params[i] = extra[i];

    var signatureBase = [];
    var keys = Object.keys(params).sort();
    for (i in keys)
        signatureBase.push(keys[i] + '=' + params[keys[i]]);

    var signatureBaseString = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(signatureBase.join('&'));

    params.oauth_signature = encodeURIComponent(
        CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA1(signatureBaseString, settings.consumer_secret + '&' + (session_secret || ''))
        )
    );

    var params_prepared = [];
    for (i in params) {
        params_prepared.push(i + '="' + params[i] + '"');
    }
    GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: {
            Authorization: 'OAuth ' + params_prepared.join(', ')
        },
        onload: function (r) {
            if (r.status == 200) {
                var oauth = {};
                var response = r.responseText.split('&');
                for (var i in response) {
                    var kv = response[i].split('=');
                    oauth[kv[0]] = kv[1];
                }
                callback(oauth);
            }
            else if (r.status == 401) {   // old tokens: reload page
                console.log('oauth error 401: ' + r.responseText);
                SignOut();
            }
            else
                console.log('oauth error: ' + r.status + ' ' + r.responseText);
        }
    });
}

function SignInSMS() {
    setSet('consumer_secret', $('#secret').val());
    if (settings.consumer_secret) {
        OAuthDigits('oauth2/token', {
            form: {
                grant_type: 'client_credentials'
            },
            token_type: 'Basic',
            access_token: btoa('9I4iINIyd0R01qEPEwT9IC6RE:' + settings.consumer_secret)
        }, function (response_token) {
            OAuthDigits('1.1/guest/activate.json', {
                token_type: response_token.token_type,
                access_token: response_token.access_token
            }, function (response_activate) {
                var phone = $('<input size="20" placeholder="+79001234567" type="text"/>');
                $(document.body).append('<br/>', phone, $('<a class="button">Send SMS</a>').click(function () {
                    OAuthDigits('1/sdk/login', {
                        form: {
                            x_auth_phone_number: phone.val(),
                            verification_type: 'sms'
                        },
                        guest: response_activate.guest_token,
                        token_type: response_token.token_type,
                        access_token: response_token.access_token
                    }, function (response_login) {
                        var code = $('<input size="12" placeholder="Code from SMS" type="text"/>');
                        $(document.body).append('<br/>', code, $('<a class="button">Check code</a>').click(function () {
                            OAuthDigits('auth/1/xauth_challenge.json', {
                                form: {
                                    login_verification_request_id: response_login.login_verification_request_id,
                                    login_verification_user_id: response_login.login_verification_user_id,
                                    login_verification_challenge_response: code.val()
                                },
                                guest: response_activate.guest_token,
                                token_type: response_token.token_type,
                                access_token: response_token.access_token
                            }, function (response_xauth) {
                                localStorage.setItem('session_key', response_xauth.oauth_token);
                                localStorage.setItem('session_secret', response_xauth.oauth_token_secret);
                                session_key = response_xauth.oauth_token;
                                session_secret = response_xauth.oauth_token_secret;
                                SignIn3(session_key, session_secret);
                            });
                        }));
                    });
                }));
            });
        });
    }
}

function OAuthDigits(endpoint, options, callback) {
    Progress.start();
    var args = {
        method: 'POST',
        url: 'https://api.digits.com/' + endpoint,
        headers: {
            'Authorization': options.token_type + ' ' + options.access_token
        },
        onload: function (r) {
            Progress.stop();
            if (r.status == 200)
                callback(JSON.parse(r.responseText.replace(/"login_verification_user_id":(\d+)/, '"login_verification_user_id":"$1"'))); // fix for integral precision in JS
            else if (r.status == 401 || r.status == 400)   // wrong sms code
                alert('Authorization error!');
        }
    };
    if (options.guest) {
        args.headers['x-guest-token'] = options.guest;
    }
    if (options.form) {
        args.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        args.data = '';
        for (var i in options.form)
            args.data += i + '=' + encodeURIComponent(options.form[i]) + '&';
        args.data = args.data.substr(0, args.data.length - 1);
    }
    GM_xmlhttpRequest(args);
}

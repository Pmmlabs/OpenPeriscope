// ==UserScript==
// @id          OpenPeriscope@pmmlabs.ru
// @name        Periscope Web Client
// @namespace   https://greasyfork.org/users/23
// @description Periscope client based on API requests. Visit example.net for launch.
// @include     https://api.twitter.com/oauth/404*
// @include     http://example.net/*
// @version     1.2
// @author      Pmmlabs@github
// @grant       GM_xmlhttpRequest
// @connect     periscope.tv
// @connect     twitter.com
// @require     https://code.jquery.com/jquery-1.11.3.js
// @require     http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha1.js
// @require     http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js
// @require     http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js
// @require     http://leaflet.github.io/Leaflet.markercluster/dist/leaflet.markercluster-src.js
// @require     https://github.com/iamcal/js-emoji/raw/master/lib/emoji.js
// @downloadURL https://github.com/Pmmlabs/OpenPeriscope/raw/master/Periscope_Web_Client.user.js
// @updateURL   https://github.com/Pmmlabs/OpenPeriscope/raw/master/Periscope_Web_Client.meta.js
// @icon        https://github.com/Pmmlabs/OpenPeriscope/raw/master/images/openperiscope.png
// @noframes
// ==/UserScript==

var emoji = emoji || new EmojiConvertor();  // js-emoji 3.0 upgrade
NODEJS = typeof GM_xmlhttpRequest == 'undefined';
var IMG_PATH = 'https://raw.githubusercontent.com/Pmmlabs/OpenPeriscope/master';
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
    };
    IMG_PATH = '';
}
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
    html, body, #left, #Map, #Chat {\
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
    a {\
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
    .button, .card {\
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
    .menu:hover:not(.active) {\
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
    #display_name {\
        font-size: 16px;\
    }\
    .username, .leaflet-container a.username {\
        color: grey;\
        font-weight: bold;\
        max-height: 1.5em;\
        overflow: hidden;\
        text-overflow: ellipsis;\
        cursor: pointer;\
    }\
    #Map, #Chat {\
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
        width: 300px;\
        min-height: 128px;\
    }\
    .description a {\
        font-weight: bold;\
    }\
    .description img {\
        float: left;\
        margin-right: 10px;\
    }\
    .righticon {\
        float: right;\
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
    dt {\
        width: 150px;\
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
        transition: box-shadow .25s;\
        border-radius: 2px;\
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
    }\
    #chat {\
        margin-right: 250px;\
        word-break: break-all;\
    }\
    #chat, #userlist {\
        border: 1px solid #bcbcbc;\
        height: 84%;\
        padding: 5px;\
        overflow-y: auto;\
    }\
    .user {\
        white-space: nowrap;\
    }\
    #chat .user {\
        color: #2927cc;\
        cursor: pointer;\
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
    #sendMessage, #sendLike, #underchat label {\
        float: right;\
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
        background: url("https://abs.twimg.com/sticky/default_profile_images/default_profile_4_reasonably_small.png");\
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
    .verifiedicon {\
        float: right;\
    }\
</style>';

if (location.href.indexOf('twitter.com/oauth/404') > 0) {
    location.href = 'http://example.net/' + location.search;
} else {
    $('style').remove();
    $(document.head).append(css, '<link href="https://fonts.googleapis.com/css?family=Roboto&subset=latin,cyrillic" rel="stylesheet" type="text/css">');
    
    document.title = 'OpenPeriscope';
    var oauth_token, oauth_verifier, session_key, session_secret, loginTwitter, consumer_secret = localStorage.getItem('consumer_secret');
    
    $(function() {
        $(document.body).html('<div id="left"/><div id="right"/>').append(Progress.elem);
        if (loginTwitter = localStorage.getItem('loginTwitter')) {
            loginTwitter = JSON.parse(loginTwitter);
            Ready(loginTwitter);
        } else if ((session_key = localStorage.getItem('session_key')) && (session_secret = localStorage.getItem('session_secret'))) {
            SignIn3(session_key, session_secret);
        } else if ((oauth_token = localStorage.getItem('oauth_token')) && (oauth_verifier = localStorage.getItem('oauth_verifier'))) {
            SignIn2(oauth_token, oauth_verifier);
        } else if ((oauth_token = getParameterByName('oauth_token')) && (oauth_verifier = getParameterByName('oauth_verifier'))) {
            localStorage.setItem('oauth_token', oauth_token);
            localStorage.setItem('oauth_verifier', oauth_verifier);
            SignIn2(oauth_token, oauth_verifier);
        } else {
            var signInButton = $('<a class="button">Sign in with twitter</a>').click(SignIn1);
            $(document.body).html('<input type="text" id="secret" size="60" placeholder="Periscope consumer secret" value="' +
                (consumer_secret || '') + '"/><br/>').append(signInButton);
        }
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function Ready(loginInfo) {
    console.log('ready! ', loginInfo);
    var signOutButton = $('<a class="button">Sign out</a>');
    signOutButton.click(SignOut);

    var userLink = $('<div id="display_name">' + emoji.replace_unified(loginInfo.user.display_name) + '</div>\
        <a class="username">@' + (loginInfo.user.username || loginInfo.user.twitter_screen_name) + '</a>');
    userLink.click(switchSection.bind(null, 'User', loginInfo.user.id));
    var left = $('#left').append(signOutButton)
        .append('<img src="' + loginInfo.user.profile_image_urls[1].url + '" width="140"/>')
        .append(userLink);
    var menu = [
        {text: 'API test', id: 'ApiTest'},
        {text: 'Map', id: 'Map'},
        {text: 'Top', id: 'Top'},
        {text: 'Following', id: 'Following'},
        {text: 'Newest', id: 'Newest'},
        {text: 'New broadcast', id: 'Create'},
        {text: 'Chat', id: 'Chat'},
        {text: 'Suggested people', id: 'People'},
        {text: 'User', id: 'User'}
    ];
    for (var i in menu) {
        var link = $('<div class="menu" id="menu'+menu[i].id+'">' + menu[i].text + '</div>');
        link.click(switchSection.bind(null, menu[i].id));
        left.append(link);
    }
    $('.menu').first().click();
    left.append('<label title="All API requests will be logged to console"><input type="checkbox" id="debug"/> Debug mode</label>');
    emoji.img_sets[emoji.img_set].path = 'http://unicodey.com/emoji-data/img-apple-64/';
    // Lazy load
    var right = $('#right');
    $(window).on('scroll', function () {
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
    $(window).on('popstate', function(event) {
        event = event.originalEvent;
        if (event.state && event.state.section)
            switchSection(event.state.section, event.state.param, true);
    });
}
function switchSection(section, param, popstate) {
    // Switch menu
    $('.menu.active').removeClass('active');
    $('#menu'+section).addClass('active');
    // Switch content
    $('#right > div:visible').hide();
    var sectionContainer = $('#' + section);
    if (!sectionContainer.length)
        Inits[section]();
    else
        sectionContainer.show();
    if (param && param.target)  // jQuery event
        param = null;
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
        }
    if (popstate != true)
        history.pushState({section: section, param: param}, section, '/' + section + (param ? '/' + param : ''));
}
var Progress = {
    elem: $('<div id="progress"/>'),
    count: 0,
    start: function(){
        this.count++;
        this.elem.css('visibility', 'visible');
        this.elem.css('width','100%');
    },
    stop: function(){
        this.count--;
        if (!this.count) {  // if there is unfinished requests
            this.elem.css('width', '0');
            this.elem.css('visibility', 'hidden');
        }
    }
}
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
var Inits= {
Map: function () {
    $(document.head).append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />')
        .append('<link rel="stylesheet" href="http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css" />');
    $('#right').append('<div id="Map"/>');
    var map = L.map('Map').setView([0, 0], 2);
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(function (position) {
            map.setView([position.coords.latitude, position.coords.longitude], 11);
        });
    var tileLayers = [
        {
            text: "Open Street Map",
            layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; OpenStreetMap'
            }).addTo(map)
        },
        {
            text: "Mapbox",
            layer: L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpamV0Zms2ZzAwMGh0Zm01MDR3YmV2cHgifQ.m9a-_eKcMy9A6glxEtuj3Q', {
                attribution: 'Map data &copy; OpenStreetMap'
            })
        },
        {
            text: "Google",
            layer: L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
                subdomains: '123',
                attribution: 'Map data &copy; Google'
            })
        }
    ];

    var tileLayersMin = {};
    for (var i in tileLayers)
        tileLayersMin[tileLayers[i].text] = tileLayers[i].layer;
    L.control.layers(tileLayersMin).addTo(map);
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
                        broadcast_ids: [stream.id]
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
        });
    };
    map.on('moveend', refreshMap);
    refreshMap();
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
        Api('rankedBroadcastFeed', {languages: [langDt.find('.lang').val()]}, refreshList(ranked));
        Api('featuredBroadcastFeed', {}, refreshList(featured));
    });
    var sort = $('<a class="watching righticon">Sort by watching</a>').click(sortClick.bind(null, ranked));
    $('#right').append($('<div id="Top"/>').append(langDt, button, '<h3>Featured</h3>', featured, sort, '<h3>Ranked</h3>', ranked));
    button.click();
},
Following: function () {
    var result = $('<div/>');
    var button = $('<a class="button">Refresh</a>').click(Api.bind(null, 'followingBroadcastFeed', {}, refreshList(result)));
    var sort = $('<a class="watching righticon">Sort by watching</a>').click(sortClick.bind(null, result));
    $('#right').append($('<div id="Following"/>').append(button, sort, result));
    button.click();
},
Newest: function () {
    var result = $('<div/>');
    var count = $('<input type="text" placeholder="253" size="3" value="10">');
    var since = $('<input type="text" placeholder="' + (Date.now() / 1000 | 0) + '" size="12">');
    var button = $('<a class="button">Refresh</a>').click(Api.bind(null, 'mapBroadcastFeed', {
        count: +count.val().trim() || 253,
        since: +since.val().trim() || (Date.now() / 1000 | 0 ) - 60
    }, refreshList(result)));
    var sort = $('<a class="watching righticon">Sort by watching</a>').click(sortClick.bind(null, result));
    $('#right').append($('<div id="Newest"/>').append('Count: ', count, 'Since: ', since, button, sort, result));
    button.click();
},
Create: function () {
    $('#right').append('<div id="Create">' +
        '<dt>Title:</dt><input id="status" type="text" autocomplete="on"><br/>' +
        '<dt>Width:</dt><input id="width" type="text" autocomplete="on" placeholder="320"><br/>' +
        '<dt>Height:</dt><input id="height" type="text" autocomplete="on" placeholder="568"><br/>' +
        '<dt>Filename:</dt><input id="filename" type="text" autocomplete="on"><label><input id="camera" type="checkbox"> From camera</label><br/>' +
        '<dt>Streaming bitrate:</dt><input id="bitrate" type="text" value="200">kBps<br/>' +
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
            lat: 0,
            lng: 0,
            region: $('#server').val(),
            width: +widthInput.val(),
            height: +heightInput.val()
        }, function (createInfo) {
            Api('publishBroadcast', {
                broadcast_id: createInfo.broadcast.id,
                friend_chat: $('#friend_chat')[0].checked,
                has_location: false,
                //"locale": "ru",
                //"lat": 0.0,    // location latitude
                //"lng": -20.0,  // location longitude
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
                    '  sleep 20s\n' +
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
        const WebSocket = require('ws');
        $(window).unload(function(){
            if (ws)
                ws.close();
        });
    }

    function renderMessages(event, container) {
        if (event.occupants) {  // "presense" for websockets
            userlist.empty();
            var user;
            for (var j in event.occupants)
                if ((user = event.occupants[j]) && user.display_name) {
                    userlist.append($('<div class="user">' + emoji.replace_unified(user.display_name) + ' </div>')
                        .append($('<div class="username">(' + user.username + ')</div>')
                            .click(switchSection.bind(null, 'User', user.user_id))));
                }
        }
        else
        switch (event.type) {
            case 1:  // text message
                var date = new Date((parseInt(event.ntpForLiveFrame.toString(16).substr(0, 8), 16) - 2208988800) * 1000);
                if ($.isArray(container))   // for subtitles
                    container.push({
                        date: date,
                        user: event.username,
                        text: event.body
                    });
                else {
                    var html = $('<div/>').append('[' + zeros(date.getHours()) + ':' + zeros(date.getMinutes()) + ':' + zeros(date.getSeconds()) + '] ');
                    var username = $('<span class="user">&lt;' + event.username + '&gt;</span>');
                    username.click(function () { // insert username to text field
                        textBox.val(textBox.val() + '@' + $(this).text().substr(1, $(this).text().length - 2) + ' ');
                        textBox.focus();
                    });
                    html.append(username).append(' ').append(emoji.replace_unified(event.body).replace(/(@\S+)/g, '<b>$1</b>'));
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
                    userlist.append($('<div class="user">' + emoji.replace_unified(event.displayName) + ' </div>')
                        .append($('<div class="username">(' + event.username + ')</div>')
                            .click(switchSection.bind(null, 'User', event.remoteID))));
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
                    container.append('<div class="service">*** ' + (event.displayName || '') + ' (@' + event.username + ') has made the screenshot</div>');
                break;
            default: // service messages (event.action = join, leave, timeout, state_changed)
                /*event.occupancy && event.total_participants*/
                break;
        }
    }
    function processWSmessage (message, div) {
        message.payload = JSON.parse(message.payload);
        message.body = JSON.parse(message.payload.body);
        if ($('#autoscroll')[0].checked)
            chat[0].scrollTop = chat[0].scrollHeight;
        switch (message.kind) {
            case MESSAGE_KIND.CHAT:
                renderMessages(message.body, div);
                break;
            case MESSAGE_KIND.CONTROL:
                if (message.payload.kind == MESSAGE_KIND.PRESENCE)
                    $('#presence').text(message.body.occupancy + '/' + message.body.total_participants);
                else
                    console.log(message);
                break;
            default:
                console.log('default!', message);
        }
    }
    var playButton = $('<a class="button" id="startchat">OK</a>').click(function () {
        clearInterval(chat_interval);
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
                    userlist.append($('<div class="user">' + emoji.replace_unified(user.display_name) + ' </div>')
                        .append($('<div class="username">(' + user.username + ')</div>')
                            .click(switchSection.bind(null, 'User', user.id))));
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
                    Progress.stop();
                    data.sort(function (a, b) { return a.date - b.date; });
                    var start = new Date(broadcast.broadcast.start);
                    var srt = '';
                    for (var i = 0; i < data.length; i++) {
                        var date0 = new Date(data[i].date - start); // date of the current message
                        var date1 = new Date((i < data.length - 1 ? data[i + 1].date : new Date(broadcast.broadcast.end)) - start); // date of the next message
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
            title.html((!broadcast.signer_token?'Read-only | ':'') + '<a href="https://www.periscope.tv/w/' + broadcast.broadcast.id + '" target="_blank">' + emoji.replace_unified(broadcast.broadcast.status || 'Untitled') + '</a> | '
                + emoji.replace_unified(broadcast.broadcast.user_display_name) + ' ')
                .append(userLink,
                    broadcast.hls_url ? ' | <a href="' + broadcast.hls_url + '">M3U Link</a>' : '',
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
            // Chat reading & posting
            if (NODEJS) {
                if (ws && ws.readyState == ws.OPEN)
                    ws.pause(); // close() doesn't close :-/
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
                        if (code == 1006) { // 1006=timeout
                            setTimeout(openSocket.bind(null, failures + 1), 100);
                            console.log('reconnect');
                        } else if (code != 1000) // 1000=broadcast ended
                            console.log('websocket closed, code: ', code);
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
                        uuid: "OpenPeriscope" + Math.random(),
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
                var sendMessage = function () {
                    console.log('Sending messages available only in NW.js version');
                };
            }
            $('#sendMessage').off().click(sendMessage);
            $('#sendLike').off().click(sendMessage.bind(null, 2));
            textBox.off().keypress(function (e) {
                if (e.which == 13) {
                    sendMessage();
                    return false;
                }
            });
        }, function (error) {
            title.append('<b>' + error + '</b>');
            if (NODEJS && ws && ws.readyState == ws.OPEN)
                ws.pause(); // close() doesn't close :-/
        });
    });
    $('#right').append(
        $('<div id="Chat"/>').append(
            broadcast_id, playButton, title, '<br/><div id="presence" title="watching/maximum"/>', userlist, chat, $('<div id="underchat">').append(
                '<label><input type="checkbox" id="autoscroll" checked/> Autoscroll</label>',
                '<a class="button" id="sendLike">\u2665</a><a class="button" id="sendMessage">Send</a>', $('<div/>').append(textBox)
            )
        )
    );
},
User: function () {
    var resultUser = $('<div id="resultUser" />');
    var showButton = $('<a class="button" id="showuser">OK</a>').click(function () {
        resultUser.empty();
        Api('user', {
            user_id: $('#user_id').val().trim()
        }, function (response) {
            var user = response.user;
            resultUser.append(getUserDescription(user));
            Api('userBroadcasts', {
                user_id: user.id,
                all: true
            }, function (streams) {
                if (streams.length) {
                    var userBroadcasts = $('<div/>');
                    resultUser.append('<h1>Broadcasts</h1>', userBroadcasts);
                    refreshList(userBroadcasts)(streams);
                }
                var followersDiv = $('<div id="followers"><h1>Followers</h1></div>');
                var followingDiv = $('<div id="following"><h1>Following</h1></div>');
                resultUser.append(followersDiv).append(followingDiv);
                Api('followers', {
                    user_id: user.id
                }, function (followers) {
                    Api('following', {
                        user_id: user.id
                    }, function (following) {
                        if (following.length)
                            for (var i in following)
                                followingDiv.append($('<div class="card"/>').append(getUserDescription(following[i])));
                        else
                            followingDiv.remove();
                    });
                    if (followers.length)
                        for (var i in followers)
                            followersDiv.append($('<div class="card"/>').append(getUserDescription(followers[i])));
                    else
                        followersDiv.remove();
                });
            });
        });
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
            for (var i in response)
                result.append($('<div class="card"/>').append(getUserDescription(response[i])));
        });
    };
    var searchButton = $('<a class="button">Search</a>').click(searchPeople);
    $('#right').append($('<div id="People"/>').append(languageSelect, refreshButton, $('<input id="search" type="text">').click(searchPeople), searchButton, '<div id="resultPeople" />'));
    $("#People .lang").find(":contains(" + (navigator.language || navigator.userLanguage || "en").substr(0, 2) + ")").attr("selected", "selected");
    refreshButton.click();
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
function zeros(number) {
    return (100 + number + '').substr(1);
}
function refreshList(jcontainer) {  // use it as callback arg
    return function (response) {
        jcontainer.empty();
        var ids = [];
        for (var i in response) {
            var stream = $('<div class="card ' + response[i].state + ' ' + response[i].id + '"/>').append(getDescription(response[i]));
            var link = $('<a>Get stream link</a>');
            link.click(getM3U.bind(null, response[i].id, stream));
            jcontainer.append(stream.append(link));
            ids.push(response[i].id);
        }
        if (response.length)
            Api('getBroadcasts', {
                broadcast_ids: ids
            }, function (info) {
                for (var i in info)
                    $('.card.' + info[i].id + ' .watching').text(info[i].n_watching);
            })
    };
}
function sortClick(jcontainer) { // sort cards in given jquery-container
    var cards = jcontainer.find('.card');
    var sorted = cards.sort(function (a, b) {
        return $(b).find('.watching').text() - $(a).find('.watching').text();
    });
    jcontainer.append(sorted);
    $(window).trigger('scroll');    // for lazy load
}
function getM3U(id, jcontainer) {
    jcontainer.find('.links').empty();
    Api('getAccessPublic', {
        broadcast_id: id
    }, function (r) {
        // For live
        var hls_url = r.hls_url || r.https_hls_url;
        if (hls_url) {
            jcontainer.find('.links').append('<a href="' + hls_url + '">Live M3U link</a>');
        }
        // For replay
        var replay_url = r.replay_url;
        if (replay_url) {
            var replay_base_url = replay_url.replace('playlist.m3u8', '');
            var params = '?';
            for (var i in r.cookies)
                params += r.cookies[i].Name.replace('CloudFront-', '') + '=' + r.cookies[i].Value + '&';
            params += 'Expires=0';
            replay_url += params;
            GM_xmlhttpRequest({
                method: 'GET',
                url: replay_url,
                onload: function (m3u_text) {
                    m3u_text = m3u_text.responseText.replace(/(chunk_\d+\.ts)/g, replay_base_url + '$1' + params);
                    var filename = 'playlist.m3u8';
                    var link = $('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(m3u_text) + '" download="' + filename + '">Download replay M3U</a>').click(saveAs.bind(null, m3u_text, filename));
                        jcontainer.find('.links').append(link);                    
                }
            });
        }
    });
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
        title += '<span class="featured" style="background: #' + (stream.featured_category_color || 'FFBD00') + '">' + (stream.featured_category || 'POPULAR') + '</span>';
        if (stream.featured_reason)
            featured_reason = ' <i>'+stream.featured_reason+'</i>';
    }
    var date_created = new Date(stream.created_at);
    var duration = stream.end || stream.timedout ? new Date(new Date(stream.end || stream.timedout) - date_created) : 0;
    var userLink = $('<a class="username">' + emoji.replace_unified(stream.user_display_name) + ' (@' + stream.username + ')</a>');
    userLink.click(switchSection.bind(null, 'User', stream.user_id));
    if (stream.user_id == loginTwitter.user.id)
        var deleteLink = $('<a class="delete righticon" title="Delete"/>').click(function () {
            Api('deleteBroadcast', {broadcast_id: stream.id}, function (resp) {
                if (resp.success)
                    description.parent().remove();
            });
        });
    var screenlistLink = $('<a class="screenlist righticon">Screenlist</a>').click(function () {
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
    var chatLink = $('<a class="chatlink righticon">Chat</a>').click(switchSection.bind(null, 'Chat', stream.id));
    var description = $('<div class="description">\
                <a href="' + stream.image_url + '" target="_blank"><img lazysrc="' + stream.image_url_small + '"/></a>\
                <div class="watching righticon" title="Watching"/>\
                <a target="_blank" href="https://www.periscope.tv/w/' + stream.id + '">' + title + '</a>'+featured_reason+'\
            </div>')
        .append(deleteLink, '<br/>', screenlistLink, userLink, '<br/>', chatLink,
            'Created: ' + zeros(date_created.getDate()) + '.' + zeros(date_created.getMonth() + 1) + '.' + date_created.getFullYear() + ' ' + zeros(date_created.getHours()) + ':' + zeros(date_created.getMinutes())
            + (duration ? '<br/>Duration: ' + zeros(duration.getUTCHours()) + ':' + zeros(duration.getMinutes()) + ':' + zeros(duration.getSeconds()) : '')
            + (stream.country || stream.city ? '<br/>' + stream.country + ', ' + stream.city : ''), '<div class="links" />');
    return description[0];
}
function getUserDescription(user) {
    user.profile_image_urls.sort(function (a, b) {
        return a.width * a.height - b.width * b.height;
    });
    var verified_icon = user.is_twitter_verified ? ' <svg class="verifiedicon" title="Verified" viewBox="0 0 17 17" height="1em" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-767.000000, -573.000000)"><g transform="translate(-80.000000, -57.000000)"><g transform="translate(100.000000, 77.000000)"><g transform="translate(400.000000, 401.000000)"><g><g><g transform="translate(347.000000, 152.000000)"><path d="M1.74035847,11.2810213 C1.61434984,11.617947 1.54545455,11.982746 1.54545455,12.3636364 C1.54545455,14.0706983 2.92930168,15.4545455 4.63636364,15.4545455 C5.01725401,15.4545455 5.38205302,15.3856502 5.71897873,15.2596415 C6.22025271,16.2899361 7.2772042,17 8.5,17 C9.7227958,17 10.7797473,16.2899361 11.2810213,15.2596415 L11.2810213,15.2596415 C11.617947,15.3856502 11.982746,15.4545455 12.3636364,15.4545455 C14.0706983,15.4545455 15.4545455,14.0706983 15.4545455,12.3636364 C15.4545455,11.982746 15.3856502,11.617947 15.2596415,11.2810213 C16.2899361,10.7797473 17,9.7227958 17,8.5 C17,7.2772042 16.2899361,6.22025271 15.2596415,5.71897873 C15.3856502,5.38205302 15.4545455,5.01725401 15.4545455,4.63636364 C15.4545455,2.92930168 14.0706983,1.54545455 12.3636364,1.54545455 C11.982746,1.54545455 11.617947,1.61434984 11.2810213,1.74035847 C10.7797473,0.71006389 9.7227958,0 8.5,0 C7.2772042,0 6.22025272,0.71006389 5.71897873,1.74035847 C5.38205302,1.61434984 5.01725401,1.54545455 4.63636364,1.54545455 C2.92930168,1.54545455 1.54545455,2.92930168 1.54545455,4.63636364 C1.54545455,5.01725401 1.61434984,5.38205302 1.74035847,5.71897873 C0.71006389,6.22025272 0,7.2772042 0,8.5 C0,9.7227958 0.71006389,10.7797473 1.74035847,11.2810213 L1.74035847,11.2810213 Z" opacity="1" fill="#88C9F9"></path><path d="M11.2963464,5.28945679 L6.24739023,10.2894568 L7.63289664,10.2685106 L5.68185283,8.44985845 C5.27786241,8.07328153 4.64508754,8.09550457 4.26851062,8.499495 C3.8919337,8.90348543 3.91415674,9.53626029 4.31814717,9.91283721 L6.26919097,11.7314894 C6.66180802,12.0974647 7.27332289,12.0882198 7.65469737,11.7105432 L12.7036536,6.71054321 C13.0960757,6.32192607 13.0991603,5.68876861 12.7105432,5.29634643 C12.3219261,4.90392425 11.6887686,4.90083965 11.2963464,5.28945679 L11.2963464,5.28945679 Z" fill="#FFFFFF"></path></g></g></g></g></g></g></g></g></svg>' : '';
    return $('<div class="description"/>')
        .append((user.profile_image_urls.length ? '<a href="' + user.profile_image_urls[user.profile_image_urls.length - 1].url + '" target="_blank"><img class="avatar" width="128" lazysrc="' + user.profile_image_urls[0].url + '"></a>' : '<img class="avatar" width="128"/>')
        + '<div class="watching righticon" title="Followers">' + user.n_followers + '</div>'
        + (user.n_hearts ? '<div class="hearts righticon" title="hearts">' + user.n_hearts + '</div>' : '')
        + '<a class="twitterlink righticon" title="Profile on Twitter" target="_blank" href="https://twitter.com/' + user.username + '"><svg viewBox="0 0 16 14" height="1em" version="1.2"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-187.000000, -349.000000)" fill="#A4B8BE"><g transform="translate(187.000000, 349.000000)"><path d="M16,2.19685162 C15.4113025,2.4579292 14.7786532,2.63438042 14.1146348,2.71373958 C14.7924065,2.30746283 15.3128644,1.66416205 15.5579648,0.897667303 C14.9237353,1.27380396 14.2212078,1.5469961 13.4734994,1.69424362 C12.8746772,1.05626857 12.0215663,0.6576 11.0774498,0.6576 C9.26453784,0.6576 7.79475475,2.12732457 7.79475475,3.94011948 C7.79475475,4.19739297 7.8238414,4.44793615 7.87979078,4.68817903 C5.15161491,4.55129033 2.73285782,3.24443931 1.11383738,1.25847055 C0.83128132,1.74328711 0.669402685,2.30717021 0.669402685,2.90874306 C0.669402685,4.04757037 1.24897034,5.05231817 2.12976334,5.64095711 C1.591631,5.62392649 1.08551154,5.4762693 0.642891108,5.23040808 C0.64265701,5.2441028 0.64265701,5.25785604 0.64265701,5.27166782 C0.64265701,6.86212833 1.77416877,8.18887766 3.27584769,8.49039564 C3.00037309,8.56542399 2.71038443,8.60551324 2.41097333,8.60551324 C2.19946596,8.60551324 1.99381104,8.58497115 1.79342331,8.54663764 C2.21111233,9.85079653 3.42338783,10.7998291 4.85981199,10.8263406 C3.7363766,11.706724 2.32096273,12.2315127 0.783057171,12.2315127 C0.518116976,12.2315127 0.256805296,12.2160037 0,12.1856881 C1.45269395,13.1170462 3.17817038,13.6604458 5.0319324,13.6604458 C11.0697831,13.6604458 14.3714986,8.65853639 14.3714986,4.32076252 C14.3714986,4.17843105 14.3683383,4.0368604 14.3620176,3.89610909 C15.0033286,3.43329772 15.5598961,2.85513466 16,2.19685162" id="Fill-1" sketch:type="MSShapeGroup"></path></g></g></g></svg></a>'
        + '<a class="periscopelink righticon" title="Profile on Periscope" target="_blank" href="https://periscope.tv/' + user.username + '"><svg version="1.1" height="1em" viewBox="0 0 113.583 145.426"><g><path fill="#A4B8BE" class="tofill" d="M113.583,56.791c0,42.229-45.414,88.635-56.791,88.635C45.416,145.426,0,99.02,0,56.791	C0,25.426,25.426,0,56.792,0C88.159,0,113.583,25.426,113.583,56.791z"/><path fill="#FFFFFF" d="M56.792,22.521c-2.731,0-5.384,0.327-7.931,0.928c4.619,2.265,7.807,6.998,7.807,12.489	c0,7.686-6.231,13.917-13.917,13.917c-7.399,0-13.433-5.779-13.874-13.067c-4.112,5.675-6.543,12.647-6.543,20.191	c0,19.031,15.427,34.458,34.458,34.458S91.25,76.01,91.25,56.979S75.823,22.521,56.792,22.521z"/></g></svg></a>')
        .append($('<div class="username">' + verified_icon + emoji.replace_unified(user.display_name) + ' (@' + user.username + ')</div>').click(switchSection.bind(null, 'User', user.id)))
        .append('Created: ' + (new Date(user.created_at)).toLocaleString()
        + (user.description ? '<div class="userdescription">' + emoji.replace_unified(user.description) +'</div>': '<br/>'))
        .append($('<a class="button">' + (user.is_following ? 'unfollow' : 'follow') + '</a>').click(function () {
            var el = this;
            Api(el.innerHTML, { // follow or unfollow
                user_id: user.id
            }, function (r) {
                if (r.success)
                    el.innerHTML = el.innerHTML == 'follow' ? 'unfollow' : 'follow';
            })
        }))
        .append('<div style="clear:both"/>');
}
/* LEVEL 0 */
function Api(method, params, callback, callback_fail) {
    if (!params)
        params = {};
    if (loginTwitter && loginTwitter.cookie)
        params.cookie = loginTwitter.cookie;
    Progress.start();
    GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.periscope.tv/api/v2/' + method,
        data: JSON.stringify(params),
        onload: function (r) {
            Progress.stop();
            if (r.status == 200) {
                var response = JSON.parse(r.responseText);
                callback(response);
                if ($('#debug').length && $('#debug')[0].checked)
                    console.log('Method:', method, 'params:', params, 'response:', response);
                $(window).trigger('scroll');    // for lazy load
            } else {
                var error = 'API error: ' + r.status + ' ' + r.responseText;
                console.log(error);
                if (callback_fail)
                    callback_fail(error);
            }
        }
    });
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
    OAuth('access_token', function (oauth) {
        localStorage.setItem('session_key', oauth.oauth_token);
        localStorage.setItem('session_secret', oauth.oauth_token_secret);
        session_key = oauth.oauth_token;
        session_secret = oauth.oauth_token_secret;
        SignIn3(session_key, session_secret);
    }, {oauth_token: oauth_token, oauth_verifier: oauth_verifier});
}
function SignIn1() {
    consumer_secret = $('#secret').val();
    if (consumer_secret) {
        localStorage.setItem('consumer_secret', consumer_secret);
        $(this).text('Loading...');
        OAuth('request_token', function (oauth) {
            location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauth.oauth_token;
        }, {oauth_callback: (NODEJS ? 'app://openperiscope/index.html' : '404')});
    }
}
function SignOut() {
    localStorage.clear();
    localStorage.setItem('consumer_secret', consumer_secret);
    location.pathname = 'index.html';
}
function OAuth(endpoint, callback, extra) {
    var method = 'POST';
    var url = 'https://api.twitter.com/oauth/' + endpoint;
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
            CryptoJS.HmacSHA1(signatureBaseString, consumer_secret + '&' + (session_secret || ''))
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

// ==UserScript==
// @id          Periscope@pmmlabs.ru
// @name        Periscope Web Client
// @namespace   https://greasyfork.org/users/23
// @description Periscope client based on API requests. Visit example.net for launch.
// @include     https://*twitter.com/oauth/404*
// @include     http://example.net/*
// @version     1.0
// @author      Pmmlabs@github
// @grant       GM_xmlhttpRequest
// @require     https://code.jquery.com/jquery-1.11.3.js
// @require     http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha1.js
// @require     http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js
// @require     http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js
// @require     http://leaflet.github.io/Leaflet.markercluster/dist/leaflet.markercluster-src.js
// @downloadURL https://raw.githubusercontent.com/Pmmlabs/periscope.js/master/Periscope_Web_Client.user.js
// @updateURL   https://raw.githubusercontent.com/Pmmlabs/snapster/master/Periscope_Web_Client.meta.js
// @noframes
// ==/UserScript==

if (location.href.indexOf('.twitter.com/oauth/404') > 0) {
    location.href = 'http://example.net/' + location.search;
}

$('style').remove();
$(document.head).append('<style>\
    #secret {\
        font-size:1.5em;\
        display: block;\
    }\
    .button {\
        background-color: #4C4CF8;\
        color: #FFF;\
        border-radius: 5px;\
        padding: 10px;\
        text-decoration: none;\
        cursor: pointer;\
    }\
    .menu {\
        background-color: #4C4CF8;\
        color: white;\
        padding: 5px;\
        cursor: pointer;\
    }\
    .menu.active {\
        background-color: #4192ED;\
    }\
    #spinner {\
        display: none;\
        float:right;\
    }\
    #left > * {\
        margin-bottom: 5px;\
        margin-top: 10px;\
    }\
    #left {\
        position: fixed;\
    }\
    #right {\
        width: auto;\
        height: 600px;\
        margin-left: 220px;\
    }\
    #display_name {\
        font-size: 16px;\
    }\
    .username {\
        color: grey;\
    }\
    #Map {\
        width:100%;\
        height:100%;\
    }\
    .live-cluster-small div{\
        background-color: rgba(222, 0, 0, 0.6);\
    }\
    .live-cluster-medium div {\
        background-color: rgba(139, 0, 0, 0.6);\
    }\
    .live-cluster-large div {\
        background-color: rgba(71, 0, 0, 0.6);\
    }\
    .replay-cluster-small div {\
        background-color: rgba(59, 51, 227, 0.6);\
    }\
    .replay-cluster-medium div {\
        background-color: rgba(41, 36, 164, 0.6);\
    }\
    .replay-cluster-large div {\
        background-color: rgba(21, 18, 80, 0.6);\
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
        height: 128px;\
    }\
    .description a {\
        font-weight: bold;\
    }\
    .description img {\
        float: left;\
        margin-right: 10px;\
    }\
    .watching {\
        float: right;\
        padding-left: 20px;\
        background-image: url("https://code.jquery.com/mobile/1.4.5/images/icons-png/user-black.png");\
        background-repeat: no-repeat;\
        background-position: 0 center;\
    }\
    dt {\
        width: 150px;\
        float: left;\
    }\
    #ApiTest textarea {\
        width: 500px;\
        height: 100px;\
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
    .stream {\
        border-left: 5px solid;\
        margin: 5px;\
        font: 14px/1.3 "Helvetica Neue",Arial,Helvetica,sans-serif;\
        height: 128px;\
    }\
    .stream.RUNNING {\
        border-color: #ED4D4D;;\
    }\
    .stream.ENDED {\
        border-color: #4350E9;\
    }\
    .stream img {\
        height: 128px;\
    }\
    .stream a {\
        color: #0078A8;\
    }\
    #result {\
        margin-top: 10px;\
    }\
</style>');

$(document.body).html('<div style="width: 100%"><div id="left"/><div id="right"/></div>');
document.title = 'Periscope Web Client';

var oauth_token, oauth_verifier, session_key, session_secret, loginTwitter, consumer_secret = localStorage.getItem('consumer_secret');
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
    var signInButton = $('<a class="button">Sign in with twitter</a>');
    signInButton.click(SignIn1);
    $('#left').append('<input type="text" id="secret" size="60" placeholder="Periscope consumer secret" value="' +
        (consumer_secret || '') + '"/><br/>').append(signInButton);
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

    var left = $('#left').append(signOutButton)
        .append('<img src="http://s.ytimg.com/yts/img/icn_loading_animated-vflff1Mjj.gif" id="spinner" />\
        <br/><img src="' + loginInfo.user.profile_image_urls[1].url + '"/>\
        <div id="display_name">' + loginInfo.user.display_name + '</div>\
        <div class="username">@' + loginInfo.user.username + '</div>');
    var menu = [
        {text: 'Map', id: 'Map'},
        {text: 'Top', id: 'Top'},
        {text: 'New broadcast', id: 'Create'},
        {text: 'API test', id: 'ApiTest'}
    ];
    for (var i in menu) {
        var link = $('<div class="menu">' + menu[i].text + '</div>');
        link.click(SwitchSection.bind(null, link, menu[i].id));
        left.append(link);
    }
    $('.menu').last().click();
}
function SwitchSection(elem, section) {
    // Switch menu
    $('.menu.active').removeClass('active');
    $(elem).addClass('active');
    // Switch content
    $('#right > div:visible').hide();
    var sectionContainer = $('#' + section);
    if (!sectionContainer.length)
        this['Init' + section]();
    else
        sectionContainer.show();
}
function InitMap() {
    $(document.head).append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />')
        .append('<link rel="stylesheet" href="http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css" />');
    $('#right').append('<div id="Map"/>');
    var map = L.map('Map').setView([51.6681, 39.2075], 11);
    var tileLayers = [
        {
            text: "Open Street Map",
            layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; OpenStreetMap'
            }).addTo(map)
        },
        {
            text: "mapbox",
            layer: L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q&update=iewnw', {
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
    var refreshMap = function (e) {
        //if (e && e.hard === false) return;    // zoom change case
        var mapBounds = map.getBounds();
        Api('mapGeoBroadcastFeed', {
            "include_replay": true,
            "p1_lat": mapBounds._northEast.lat,
            "p1_lng": mapBounds._northEast.lng,
            "p2_lat": mapBounds._southWest.lat,
            "p2_lng": mapBounds._southWest.lng
        }, function (r) {
            console.log(r);
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
            for (var i = 0; i < r.length; i++) {
                var stream = r[i];
                var title = stream.status || stream.user_display_name;
                var marker = L.marker(new L.LatLng(stream.ip_lat, stream.ip_lng), {title: title});
                if (!marker.getLatLng().equals(openLL)) {
                    var description = getDescription(stream);
                    marker.bindPopup(description);
                    marker.on('popupopen', getM3U.bind(null, stream.id, $(description)));
                    marker.on('popupopen', Api.bind(null, 'getBroadcasts', {
                        broadcast_ids: [stream.id]
                    }, function (info) {
                        $('.leaflet-popup-content .watching').text(info[0].n_watching + info[0].n_web_watching);
                    }));
                    (stream.state == 'RUNNING' ? live : replay).addLayer(marker);
                }
            }
        });
    };
    map.on('moveend', refreshMap);
    refreshMap();
}
function InitApiTest() {
    var submitButton = $('<a class="button">Submit</div>');
    submitButton.click(function () {
        try {
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
                console.log(response);
            }, function (error) {
                $('#response').text(error);
            });
        } catch (e) {
            $('#response').text(e.toString());
        }
    });
    $('#right').append('<div id="ApiTest">Some documentation can be found in ' +
        '<a href="https://github.com/gabrielg/periscope_api/blob/master/API.md" target="_blank">"periscope_api" repository</a>' +
        ' or in <a href="https://github.com/Pmmlabs/periscope_api/blob/api/API.md" target="_blank">my fork</a>' +
        '<br/><dt>Method</dt><input id="method" type="text" placeholder="mapGeoBroadcastFeed"/><br/>' +
        '<dt>Parameters</dt><textarea id="params" placeholder=\'{"include_replay": true, "p1_lat": 1, "p1_lng": 2, "p2_lat": 3, "p2_lng": 4}\'/><br/><br/>');
    $('#ApiTest').append(submitButton).append('<br/><br/><pre id="response"/>Response is also displayed in the browser console</pre>');
}
function InitTop() {
    var refreshList = function() {
        Api('rankedBroadcastFeed', {
            languages: [$('#lang').val()]
        }, function (response) {
            var result = $('#result');
            result.empty();
            var ids =[];
            for (var i in response) {
                var stream = $('<div class="stream ' + response[i].state + ' '+response[i].id+'">').append(getDescription(response[i]));
                var link = $('<a href="#">Get stream link</a>');
                link.click(getM3U.bind(null, response[i].id, stream));
                result.append(stream.append(link).append('<br/>'));
                ids.push(response[i].id);
            }
            Api('getBroadcasts', {
                broadcast_ids: ids
            }, function(info){
                for (var i in info)
                    $('.stream.'+info[i].id+' .watching').text(info[i].n_watching+info[i].n_web_watching);
            })
        });
    };

    $('#right').append('<div id="Top" />');
    var refreshButton = $('<a class="button">Refresh</a>');
    refreshButton.click(refreshList);
    $('#Top').append(refreshButton).append('Language: <select id="lang">\
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
        </select>\
        <div id="result" />');

    $("#lang").find(":contains("+(navigator.language || navigator.userLanguage).substr(0, 2)+")").attr("selected", "selected");
    refreshList();
}
function InitCreate() {
    $('#right').append('<div id="Create">' +
        'Title: <input id="status" type="text" autocomplete="on"><br/>' +
        'Width: <input id="width" type="text" autocomplete="on" placeholder="320"><br/>' +
        'Height: <input id="height" type="text" autocomplete="on" placeholder="568"><br/>' +
        'Filename: <input id="filename" type="text" autocomplete="on"><br/>' +
        'Streaming bitrate: <input id="bitrate" type="text" value="200">kBps<br/>' +
        'Server: <select id="server">' +
            '<option>us-west-1</option>' +
            '<option selected>eu-central-1</option>' +
        '<select><br/>' +
        '<br/></div>');
    var createButton=$('<a class="button">Create</a>');
    createButton.click(createBroadcast);
    $('#Create').append(createButton);
}
function createBroadcast(){
    Api('createBroadcast',{
        lat: 0,
        lng: 0,
        region: $('#server').val(),
        width: +$('#width').val(),
        height: +$('#height').val()
    }, function(createInfo){
        //console.log(createInfo);
        Api('publishBroadcast', {
            broadcast_id: createInfo.broadcast.id,
            friend_chat: false,
            has_location: false,
            //"locale": "ru",
            //"lat": 0.0,    // location latitude
            //"lng": -20.0,  // location longitude
            status: $('#status').val().trim()
        }, function(){
            var code = 'ffmpeg -re -i "'+$('#filename').val()+'" -vcodec libx264 -b:v '+$('#bitrate').val()+'k' +
                ' -strict experimental -acodec aac -b:a 128k -ac 1 -f flv' +
                ' rtmp://'+createInfo.host+':'+createInfo.port+'/liveorigin?t='+createInfo.credential+'/'+createInfo.stream_name+' & '+
                ' while true; do sleep 5s; curl --form "cookie=' + loginTwitter.cookie +'" --form "broadcast_id='+createInfo.broadcast.id+'" https://api.periscope.tv/api/v2/pingBroadcast;'+
                ' done;'+
                'curl --form "cookie=' + loginTwitter.cookie +'" --form "broadcast_id='+createInfo.broadcast.id+'" https://api.periscope.tv/api/v2/endBroadcast';
            $('#Create').append('<pre>' + code + '</pre>' +
                '<a target="_blank" href="https://www.periscope.tv/w/'+createInfo.broadcast.id+'">Watch your stream</a> | ' +
                '<a href="data:text/plain;base64,' + btoa('#!/bin/bash\n'+unescape(encodeURIComponent(code))) + '" download="stream.sh">Download .SH</a>');
        });
        //var broadcast = response.broadcast;
    });
}
function getM3U (id, jcontainer) {
    Api('getAccessPublic', {
        broadcast_id: id
    }, function (r) {
        // For live
        var hls_url = r.hls_url || r.https_hls_url;
        if (hls_url) {
            jcontainer.find('.links').html('<a href="' + hls_url + '">Live M3U link</a>');
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
            $.get(replay_url, function (m3u_text) {
                jcontainer.find('.links').html('<a href="data:text/plain;base64,' + btoa(m3u_text.replace(/(chunk_\d+\.ts)/g, replay_base_url + '$1' + params)) + '" download="playlist.m3u8">Download replay M3U</a>');
            });
        }
    });
    return false;
}
function getDescription(stream) {
    var title = stream.status || stream.user_display_name;
    var date_created = new Date(stream.created_at);
    var duration = stream.end || stream.timedout ? new Date(new Date(stream.end || stream.timedout) - date_created) : 0;
    var description = $('<div class="description">\
                <a href="'+stream.image_url+'" target="_blank"><img src="' + stream.image_url_small + '"/></a>\
                <div class="watching"></div>\
                <a target="_blank" href="https://www.periscope.tv/w/' + stream.id + '">' + title + '</a>\
                <div class="username">@' + stream.username + ' ('+stream.user_display_name+')</div>\
                Created: ' + date_created.getDate() + '.' + (date_created.getMonth()+1) + '.' + date_created.getFullYear() + ' ' + date_created.getHours() + ':' + date_created.getMinutes() + '\
                '+(duration ? '<br/>Duration: '+duration.getUTCHours()+':'+duration.getMinutes()+':'+duration.getSeconds() : '')+'\
                <br/>' + stream.country + ' ' + stream.city + '\
                <div class="links" />\
            </div>');
    return description.get(0);
}

function Api(method, params, callback, callback_fail) {
    if (loginTwitter && loginTwitter.cookie)
        params.cookie = loginTwitter.cookie;
    $('#spinner').show();
    GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.periscope.tv/api/v2/' + method,
        data: JSON.stringify(params),
        onload: function (r) {
            $('#spinner').hide();
            if (r.status == 200) {
                var response = JSON.parse(r.responseText);
                callback(response);
            } else {
                var error = 'API error: ' + r.status + ' ' + r.responseText;
                console.log(error);
                if (callback_fail)
                    callback_fail(error);
            }
        }
    })
}
function SignIn3(session_key, session_secret) {
    Api('loginTwitter', {
        "session_key": session_key,
        "session_secret": session_secret
    }, function (response) {
        localStorage.setItem('loginTwitter', JSON.stringify(response));
        loginTwitter = response;
        Ready(loginTwitter);
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
/**
 * @return {boolean}
 */
function SignIn1() {
    consumer_secret = $('#secret').val();
    if (consumer_secret) {
        localStorage.setItem('consumer_secret', consumer_secret);
        return OAuth('request_token', function (oauth) {
            location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauth.oauth_token;
        }, {oauth_callback: '404'});
    }
}
function SignOut() {
    localStorage.clear();
    localStorage.setItem('consumer_secret', consumer_secret);
    location.search = '';
}
/**
 * @return {boolean}
 */
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
    return false;
}

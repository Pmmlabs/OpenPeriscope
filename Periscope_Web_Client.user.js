// ==UserScript==
// @id          Periscope@pmmlabs.ru
// @name        Periscope Web Client
// @namespace   https://greasyfork.org/users/23
// @description Periscope client based on API requests. Visit example.net for launch.
// @include     https://api.twitter.com/oauth/404*
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

if (location.href.indexOf('https://api.twitter.com/oauth/404') == 0) {
    location.href = 'http://example.net/' + location.search;
}

$('style').remove();
$(document.head).append('<style>\
    #secret {\
        font-size:1.5em;\
        display: block;\
    }\
    #signin {\
        background: #4C4CF8 none repeat scroll 0 0;\
        color: #FFF;\
        border-radius: 5px;\
        padding: 10px;\
        text-decoration: none;\
        cursor: pointer;\
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
        width: 200px;\
        height: 600px;\
        float: left;\
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
    #map {\
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
    .description {\
        width: 300px;\
        height: 140px;\
    }\
    .description a {\
        font-weight: bold;\
    }\
    .description img {\
        float: left;\
        margin-right: 10px;\
    }\
</style>');

$(document.body).html('<div style="width: 100%"><div id="left"/><div id="right"/></div>');

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
    var signInButton = $('<a id="signin">Sign in with twitter</a>');
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
    var signOutButton = $('<a id="signin">Sign out</a>');
    signOutButton.click(SignOut);
    $('#left').append(signOutButton)
        .append('<img src="https://s.ytimg.com/yts/img/icn_loading_animated-vflff1Mjj.gif" id="spinner" height="25" />\
        <br/><img src="' + loginInfo.user.profile_image_urls[1].url + '"/>\
        <div id="display_name">' + loginInfo.user.display_name + '</div>\
        <div class="username">@' + loginInfo.user.username + '</div>');

    //Map
    $(document.head).append('<link rel="stylesheet" href="https://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />')
        .append('<link rel="stylesheet" href="http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css" />');
    $('#right').append('<div id="map"/>');
    var map = L.map('map').setView([51.6681, 39.2075], 11);
    var tileLayers = [
        {
            text: "Open Street Map",
            layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; OpenStreetMap'
            }).addTo(map)
        },
        {
            text: "cloudmade",
            layer: L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
                key: '1a1b06b230af4efdbb989ea99e9841af',
                styleId: 1632,
                attribution: 'Map data &copy; OpenStreetMap'
            })
        },
        {
            text: "mapbox",
            layer: L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q&update=iewnw', {
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
        if (e && e.hard === false) return;
        var mapBounds = map.getBounds();
        Api('mapGeoBroadcastFeed', {
            "include_replay": true,
            "p1_lat": mapBounds._northEast.lat,
            "p1_lng": mapBounds._northEast.lng,
            "p2_lat": mapBounds._southWest.lat,
            "p2_lng": mapBounds._southWest.lng
        }, function (r) {
            console.log(r);
            live.eachLayer(function (layer) {
                live.removeLayer(layer);
            });
            replay.eachLayer(function (layer) {
                replay.removeLayer(layer);
            });
            for (var i = 0; i < r.length; i++) {
                var stream = r[i];
                var title = stream.status || stream.user_display_name;
                var marker = L.marker(new L.LatLng(stream.ip_lat, stream.ip_lng), {title: title});
                marker.bindPopup('<div class="description"><img src="' + stream.image_url_small + '"/>\
                    <a target="_blank" href="https://www.periscope.tv/w/' + stream.id + '">' + title + '</a>\
                    <div class="username">@' + stream.username + '</div>\
                    </div>');
                (stream.available_for_replay ? replay : live).addLayer(marker);
            }
        });
    };
    map.on('moveend', refreshMap);
    refreshMap();
}
function Api(method, params, callback) {
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
            } else
                console.log('API error: ' + r.status + ' ' + r.responseText);
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

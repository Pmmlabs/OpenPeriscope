if (location.href == 'https://api.twitter.com/oauth/authorize') {
    var meta = $('meta[http-equiv="refresh"]');
    meta.attr('content', meta.attr('content').replace('twittersdk', 'app'));
}
/*
* Copyright 2010, Daniel Stocks (http://webcloud.se)
* Released under the MIT, BSD, and GPL Licenses.
*
* timesince.js
* --
* Extends the JavaScript Date prototype with a
* method that returns a human readable "time ago"
* string between then and now
*/

(function () {

    Date.prototype.timeSince = function () {

        var l = locale[DEFAULT_LANG];
        var now = new Date();
        var diff = this.getTime() - now.getTime();

        // Difference in seconds
        var s = parseInt(Math.abs(diff / 1000));
        var d = Math.floor(s / (3600 * 24));

        if (d === 0) {
            if (s === 0)
                return l["now"];
            if (s === 1)
                return '1 ' + l["second"];
            if (s < 60)
                return s + ' ' + l["seconds"];
            if (s < 120)
                return '1 ' + l["minute"];
            if (s < 3600)
                return (s / 60) + ' ' + l["minutes"];
            if (s < 7200)
                return '1 ' + l["hour"]
            if (s < 86400)
                return parseInt(s / 3600) + ' ' + l["hours"];
        }
        if (d == 1)
            return l["yesterday"];
        if (d < 7)
            return d + ' ' + l["days"];
        if (d < 14)
            return '1 ' + l["week"];
    }

    var DEFAULT_LANG = "EN"
    var locale = {}
    locale.EN = {
        "now": "Now",
        "second": "second ago",
        "seconds": "seconds ago",
        "minute": "minute ago",
        "minutes": "minutes ago",
        "hour": "hour ago",
        "hours": "hours ago",
        "yesterday": "Yesterday",
        "days": "days ago",
        "week": "week ago",
        "weeks": "weeks ago",
        "month": "month ago",
        "months": "months ago",
        "year": "year ago",
        "years": "years ago"
    }

})();
(function () {

    //Definition of the data adapter
    var kipptClipsDataAdapter = WinJS.Class.define(
        function (listId) {

            //Constructor
            this._minPageSize = 0;
            this._maxPageSize = 20;
            this._maxCount = 1;
            this._listId = listId;
        },

                // Data Adapter interface methods
        // These define the contract between the virtualized datasource and the data adapter.
        // These methods will be called by virtualized datasource to fetch items, count etc.
        {
            getCount: function () {
                var that = this;

                var requestStr = Kippt.urlRoot + "/api/lists/" +that._listId+"/clips"

                return WinJS.xhr({
                    headers: {
                        "X-Kippt-Username": Kippt.username,
                        "X-Kippt-API-Token": Kippt.token
                    },
                    url: requestStr
                }).then(

                //callback for success
                function success(request) {
                    var obj = JSON.parse(request.responseText);

                    if (obj && obj.meta.total_count) {
                        var count = obj.meta.total_count;
                        that._maxCount = count;
                        if (count == 0) {
                            WinJS.log && WinJS.log("The search returned 0 results.", "sample", "error");
                        }
                        return count;
                    }
                    else {
                        WinJS.log && WinJS.log("Error fetching count", "sample", "error");
                        return 0;
                    }
                },
                function error(request) {
                    if (request.status === 401) {
                        WinJS.log && WinJS.log(request.statusText, "sample", "error");
                    } else {
                        WinJS.log && WinJS.log("Error fetching data from the service. " + request.responseText, "sample", "error");
                    }
                    return 0;
                },
                function progress(request) {
                }


                );
            },

            itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                var that = this;
                if (requestIndex >= that._maxCount) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                }

                var fetchSize, fetchIndex;
                // See which side of the requestIndex is the overlap
                if (countBefore > countAfter) {
                    //Limit the overlap
                    countAfter = Math.min(countAfter, 10);
                    //Bound the request size based on the minimum and maximum sizes
                    var fetchBefore = Math.max(Math.min(countBefore, that._maxPageSize - (countAfter + 1)), that._minPageSize - (countAfter + 1));
                    fetchSize = fetchBefore + countAfter + 1;
                    fetchIndex = requestIndex - fetchBefore;
                } else {
                    countBefore = Math.min(countBefore, 10);
                    var fetchAfter = Math.max(Math.min(countAfter, that._maxPageSize - (countBefore + 1)), that._minPageSize - (countBefore + 1));
                    fetchSize = countBefore + fetchAfter + 1;
                    fetchIndex = requestIndex - countBefore;
                }


                // Return the promise from making an XMLHttpRequest to the server
                // The bing API authenticates using any username and the developer key as the password.
                return WinJS.xhr({
                    headers: { "X-Kippt-Username": "chantilli", "X-Kippt-API-Token": "56c057bc1714e0d07fbff5726267f0bc38674601" },
                    url: "https://kippt.com" + "/api/lists/" + that._listId + "/clips/?include_data=media&offset=" + fetchIndex
                }).then(

                    //Callback for success
                    function (request) {
                        var results = [], count;

                        // Use the JSON parser on the results, safer than eval
                        var obj = JSON.parse(request.responseText);

                        // Verify if the service has returned images
                        if (obj && obj.objects) {
                            var items = obj.objects;

                            // Data adapter results needs an array of items of the shape:
                            // items =[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
                            // Form the array of results objects
                            for (var i = 0, itemsLength = items.length; i < itemsLength; i++) {
                                var post = items[i];
                                var postbg = null;
                                var postdescription;
                                try {
                                    if (post.media != null && post.media.images != null && post.media.images.tile != null && post.media.images.tile.url != null) {
                                        if (post.media.images.original != null && post.media.images.original.width != null && post.media.images.original.width >= 350) {
                                            postbg = post.media.images.tile.url;
                                        }
                                    }
                                    else {
                                        postbg = null;
                                    }
                                }
                                catch (e) {
                                    postbg = null;
                                }
                                try {
                                    if (post.media != null && post.media.description != null) {
                                        postdescription = post.media.description + "...";
                                    }
                                    else {
                                        postdescription = "";
                                    }
                                }
                                catch (er) {
                                }
                                results.push({
                                    key: (post.id).toString(),
                                    data: {
                                        group: that._listId,
                                        key: post.id,
                                        title: post.title,
                                        author: post.user.username,
                                        pubDate: post.created,
                                        backgroundImage: postbg,
                                        url: post.url,
                                        content: postdescription,
                                        favorite: post.is_favorite,
                                        notes: post.notes,
                                        domain: post.url_domain,
                                        comments_count: post.comments.count,
                                        comments_data: post.comments.data
                                    }
                                });
                            }

                            WinJS.log && WinJS.log("", "sample", "status");
                            return {
                                items: results, // The array of items
                                offset: requestIndex - fetchIndex, // The offset into the array for the requested item
                            };

                        } else {
                            WinJS.log && WinJS.log(request.statusText, "sample", "error");
                            return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                        }
                    },

                    //Called on an error from the XHR Object
                    function (request) {
                        if (request.status === 401) {
                            WinJS.log && WinJS.log(request.statusText, "sample", "error");
                        } else {
                            WinJS.log && WinJS.log("Error fetching data from the service. " + request.responseText, "sample", "error");
                        }
                        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
                    });

            }


        });

    WinJS.Namespace.define("kipptClipsDataSource", {
        datasource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (listId) {
            this._baseDataSourceConstructor(new kipptClipsDataAdapter(listId));
        })
    });
})();
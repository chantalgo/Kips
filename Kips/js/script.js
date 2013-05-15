(function () {
    var kipptClipsDataAdapter = WinJS.Class.define(
        function (username, token, listId) {
            //Constructor
            this._username = username
            this._token = token;
            this._id = listId;
            this._maxlistQuerySize = 20;
            this._maxCount= 0;
            this._maxPageSize = 20;
            this._minPageSixe = 1
        },

        // IListDataDapter methods
        // These methods define the contract between the IListDataSource and the IListDataAdapter.
        // These methods will be called by virtualized datasource to fetch items, count etc.
        {
            getcount: function ()
            {
                var that = this;

                var requestStr = "https://kippt.com"
                + "/api/lists/"
                + that._id
                + "/clips/?limit="
                + that._maxlistQuerySize;


                return WinJS.xhr({
                    headers: { "X-Kippt-Username": that.username, "X-Kippt-API-Token": that.token },
                    url: requestStr
                }).then (
                
                //Callback for success
                function (request)
                {
                    var obj= JSON.parse(request.responseText);
                    
                    if (obj.total_count> 0)
                    {              
                        
                        var count = obj.total_count < that._maxCount ? that._maxlistQuerySize:obj.total_count;
                        if (count == 0) { WinJS.log && WinJS.log("The search returned 0 results.", "sample", "error"); }
                        return count;

                    }
                    else 
                    {
                        WinJS.log && WinJS.log("Error fetching results from Kippt", "sample", "error");
                        return 0;
                    }
                },
                function (requests)
                {
                    return 1;
                });
            },

            // Called by the virtualized datasource to fetch items
            // It will request a specific item and optionally ask for a number of items on either side of the requested item. 
            // The implementation should return the specific item and, in addition, can choose to return a range of items on either 
            // side of the requested index. The number of extra items returned by the implementation can be more or less than the number requested.
            //
            // Must return back an object containing fields:
            //   items: The array of items of the form items=[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
            //   offset: The offset into the array for the requested item
            //   totalCount: (optional) update the value of the count
            itemsFromIndex: function (requestIndex, countBefore, countAfter)
            {
                var that = this;

                if (requestIndex >= that._maxlistQuerySize) {
                    return WinJs.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.dpesNotExist));
                }

                var fetchSize, fetchIndex;

                var requestStr = "https://kippt.com"
                + "/api/lists/"
                + that._id
                + "/clips/?limit="
                + that._maxlistQuerySize
                +"&include_data=media";

                return WinJS.xhr({
                    headers: { "X-Kippt-Username": that.username, "X-Kippt-API-Token": that.token },
                    url: requestStr
                }).then(function (request) {
                    var results = [], count;

                    var obj = JSON.parse(request.responseText);

                    var items = obj.objects;

                    for (var i = 0, itemsLength = items.length; i < itemsLength; i++)
                    {
                        var dataItem = items[i];

                        results.push({
                            key: (dataItem.id).toString(),
                            data: {
                                title: post.title,
                                author: post.user.username,
                                pubDate: post.created,
                                backgroundImage: postbg,
                                url: post.url,
                                content: postdescription,
                                favorite: post.is_favorite,
                                notes: post.notes
                            }
                        })
                    }

                    fetchIndex = obj.offset;
                }
                )
                return {
                    items: results,
                    offset:  fetchIndex
                }
            },
        }



        )})();
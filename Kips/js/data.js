(function () {
    "use strict";
    var kipptFeed, kipptFavs, kipptList;
    var kipptLists = [];
    var kipptGroups = [];

    var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
    var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
    var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";

    var dataPromises = [];
    var blogs = [];
    var userFeed = [];

    var blogPosts = new WinJS.Binding.List();

    var list = getBlogPosts();

    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key+""; },
        function groupDataSelector(item) { return item.group; }
    );

   /* var letterItems = groupedItems.groups.createGrouped(getGroupKey, getGroupData, compareGroups);

    // Sorts the groups
    function compareGroups(leftKey, rightKey) {
        return leftKey.charCodeAt(0) - rightKey.charCodeAt(0);
    }

    // Returns the group key that an item belongs to
    function getGroupKey(dataItem) {
        console.log(dataItem);

        console.log(dataItem.title.toUpperCase().charAt(0));
        return dataItem.group.title.toUpperCase().charAt(0);
    }

    // Returns the title for a group
    function getGroupData(dataItem) {
        return  {
            title: dataItem.group.title.toUpperCase().charAt(0)
        }}
        */
    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        resolveItemReferenceL: resolveItemReferenceL,
        currentList: null,
        //letterItems: letterItems.groups
    });

    Kippt.blogPosts = blogPosts;
    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        if (typeof(key) == "string") {
            key= parseInt(key, 10);
        }
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    function resolveItemReferenceL(reference) {
        for (var i = 0; i < Data.currentList.length; i++) {
            var item = Data.currentList.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    function getFeeds() {
        // Create an object for each feed.
        var i;
        for (i = 0; i < Kippt.lists.meta.total_count; i++) {
            var obj = Kippt.lists.objects[i];
            blogs[i] = {
                key: obj.id,
                url: "http://kippt" + obj.resource_uri,
                title: obj.title,
                subtitle: obj.description,
                updated: obj.created,
                backgroundImage: lightGray,
                acquireSyndication: acquireSyndication,
                dataPromise: null,
                itemsCount: 0
            };

        };

        // Get the content for each feed in the blog's array.
        blogs.forEach(function (feed) {
            feed.dataPromise = feed.acquireSyndication(feed.key);
            dataPromises.push(feed.dataPromise);
        });

        // Return when all asynchronous operations are complete
        return WinJS.Promise.join(dataPromises).then(function () {
            return blogs;
        });

    };

    function acquireSyndication(id) {
        return WinJS.xhr({
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot+"/api/lists/"+id+"/clips/?limit=6&include_data=media"
        });
    }

    function getBlogPosts() {
        getFeeds().then(function () {
            // Process each blog.
            blogs.forEach(function (feed) {
                feed.dataPromise.then(function (articlesResponse) {
                    var articleSyndication = JSON.parse(articlesResponse.responseText);
                    // Process the blog posts.
                    getItemsFromJSON(articleSyndication, list, feed);
                });
            });
        });

        return blogPosts;
    }

    function getItemsFromJSON(articleSyndication, blogPosts, feed) {
        var posts = articleSyndication.objects;
        var max;
        feed.itemsCount = articleSyndication.meta.total_count;

        if (articleSyndication.meta.total_count > 6) {
            max = 6;
        }
        else { max = articleSyndication.meta.total_count; }
       
        // Process each blog post.
        for (var postIndex = 0; postIndex < max; postIndex++) {
            var post = posts[postIndex];
            var postbg = null;
            var postdescription;
            var clear = "";
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
                postbg= null;
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


            /*if (post.url_domain == "github.com") {
                postbg = '/images/GitHub-Mark-120px-plus.png';
            }*/
            // Store the post info we care about in the array.
            blogPosts.push({
                group: feed,
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
            });
        }
    }

    function addtoFeed(blogId, currentList) {
        var i = 0;
        for ( i = 0; i < Kippt.lists.meta.total_count; i++) {
            var obj = Kippt.lists.objects[i];
            if (blogs[i].key == blogId) {
                var feed = blogs[i];
                blogs[i].dataPromise = acquireSyndicationAll(blogs[i].key);
                blogs[i].dataPromise.then(function (articlesResponse) {
                    var articleSyndication = JSON.parse(articlesResponse.responseText);
                    // Process the blog posts.
                    getItemsFromJSONAll(articleSyndication, currentList, feed);
                })
            }

        }


    }

    function acquireSyndicationAll(id) {
            return WinJS.xhr({
                headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
                url: Kippt.urlRoot+"/api/lists/"+id+"/clips/?limit=200&include_data=media"
            });
        }

    function getItemsFromJSONAll(articleSyndication, currentList, feed) {
    
            var posts = articleSyndication.objects;
            var max;
            if (articleSyndication.meta.total_count > 200) {
                max = 200;
            }
            else { max = (articleSyndication.meta.total_count); }
            // Process each blog post.
            for (var postIndex = 0; postIndex < max; postIndex++) {
                var post = posts[postIndex];
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

                // Store the post info we care about in the array.
                currentList.push({
                    group: feed,
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
                });
            }
            Data.currentList = currentList;
        }

    function getUserFeed(type, bindinglist) {
        switch (type) {
            case "feed":
                acquireSyndicationFeed().done(function (r) {
                    var response = JSON.parse(r.responseText);
                    getItemsFromJSONFeed(response, bindinglist)
                    return;
                })
                break;
            case "favorites":
                acquireSyndicationFavorites().done(function (r) {
                    var response = JSON.parse(r.responseText);
                    getItemsFromJSONFeed(response, bindinglist)
                    return;
                })
                break;
        }
    }

    function acquireSyndicationFeed() {
        return WinJS.xhr({
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot+"/api/clips/feed?limit200&include_data=list,via,media"
        })
    }

    function acquireSyndicationFavorites() {
        return WinJS.xhr({
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot + "/api/clips/favorites?limit200&include_data=list,via,media"
        })
    }

    function getItemsFromJSONFeed(response, userFeedPosts) {
    
        var feedItems = response.objects;
        var max = feedItems.length;
            // Process each blog post.
            for (var postIndex = 0; postIndex < max; postIndex++) {
                var post = feedItems[postIndex];
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

                // Store the post info we care about in the array.
                userFeedPosts.push({
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
                });
            }
        }

    function deleteClip(id) {
        return WinJS.xhr({
            type: "DELETE",
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot+"/api/clips/"+id})
    }

        WinJS.Namespace.define("GetAllData", {
            addtoFeed: addtoFeed,
            getUserFeed: getUserFeed,
            deleteClip: deleteClip
        })
})();
﻿(function () {
    "use strict";
    var kipptFeed, kipptFavs, kipptList;
    var kipptLists = [];
    var kipptGroups = [];

    var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
    var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
    var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";

    var dataPromises = [];
    var blogs =[];

    var blogPosts = new WinJS.Binding.List();

    var list = getBlogPosts();

    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key+""; },
        function groupDataSelector(item) { return item.group; }
    );

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        resolveItemReferenceL: resolveItemReferenceL,
        currentList: null
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

        for (var i = 0; i < Kippt.lists.meta.total_count; i++) {
            var obj = Kippt.lists.objects[i];
            blogs[i] = {
                key: obj.id,
                url: "http://kippt" + obj.resource_uri,
                title: obj.title,
                subtitle: obj.description,
                updated: obj.created,
                backgroundImage: lightGray,
                acquireSyndication: acquireSyndication,
                dataPromise: null
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
        if (articleSyndication.meta.total_count > 6) {
            max = 6;
        }
        else { max = articleSyndication.meta.total_count; }
       
        // Process each blog post.
        for (var postIndex = 0; postIndex < max; postIndex++) {
            var post = posts[postIndex];
            var postbg, postdescription;
            var clear = "";
            try {
                if (post.media != null && post.media.images != null && post.media.images.tile != null && post.media.images.tile.url != null) {
                    postbg = post.media.images.tile.url;
                }
                else {
                    postbg = mediumGray;
                }
            }
            catch (e) {
                postbg= mediumGray;
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


            if (post.url_domain == "github.com") {
                postbg = '/images/GitHub-Mark-120px-plus.png';
            }
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
                notes: post.notes
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
                var postbg,postdescription;
                    try {
                        if (post.media != null && post.media.images != null && post.media.images.tile != null && post.media.images.tile.url != null) {
                            postbg = post.media.images.tile.url;
                        }
                        else {
                            postbg = mediumGray;
                        }
                    }
                    catch (e) {
                        postbg = mediumGray;
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

                if (post.url_domain == "github.com") {
                    postbg= '/images/GitHub-Mark-120px-plus.png';
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
                    notes: post.notes 
                });
            }
            Data.currentList = currentList;
        }


        WinJS.Namespace.define("GetAllData", {
            addtoFeed: addtoFeed,
        })
})();
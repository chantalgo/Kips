(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            var item = options.item;


            WinJS.Namespace.define("Share", {
                item: item
            });

            var timeago = new Date(item.pubDate * 1000).timeSince();
            if (timeago != undefined) {
                element.querySelector(".titlearea .postdate").textContent = timeago;
                element.querySelector(".titlearea .postdate").setAttribute('datetime', item.pubDate);
            }
            else {
                element.querySelector(".titlearea .pageinfo").removeNode();
            }

            if (item.group.title) {
                element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
            }
            else if (options.via) {
                switch(options.via){
                    case "feed":
                        element.querySelector(".titlearea .pagetitle").textContent = "Feed";
                        break;
                    case "favorites":
                        element.querySelector(".titlearea .pagetitle").textContent = "Favorites";
                        break;
                }
            }
            else if (!(options.via) && (!(item.group.title))) {
                var group = Data.resolveGroupReference(item.group);
                element.querySelector(".titlearea .pagetitle").textContent =group.title;

            }

            element.querySelector("article .item-title").textContent = item.title;
            element.querySelector("article .item-url").textContent = item.url;
            element.querySelector("article .item-url").href = item.url;
            element.querySelector("article .item-url").title = item.title;

            if (item.backgroundImage != null) {
                element.querySelector("article .item-image").src = item.backgroundImage;
                element.querySelector("article .item-image").alt = item.content;
            }
            else {
                element.querySelector("article .item-image").removeNode();
            }

            if (item.notes != null) {
                var markdown = document.createElement('div');
                markdown.innerHTML = new Showdown.converter().makeHtml(item.notes);
                element.querySelector("article .notes-content").appendChild(markdown);
            }
            else {
                element.querySelector("article .notes-content").removeNode();
            }

            
            element.querySelector("article .item-content").innerHTML = item.content;
            element.querySelector(".content").focus();

            //appbar.winControl.hideCommands([textSize, markItem]);

            registerForShare();

        }
    });

    function registerForShare() {
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", shareLinkHandler);
    }

    function shareLinkHandler(e) {
        var request = e.request;
        request.data.properties.title = Share.item.title;
        request.data.properties.description = Share.item.content;
        request.data.setUri(new Windows.Foundation.Uri(Share.item.url));
    }

})();
 
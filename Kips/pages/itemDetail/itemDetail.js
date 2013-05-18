(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options.item;
            if (item.group) {
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
            element.querySelector("article .item-title").textContent = item.title;
            element.querySelector("article .item-subtitle").textContent = item.url;
            element.querySelector("article .item-image").src = item.backgroundImage;
            element.querySelector("article .item-image").alt = item.content;
            element.querySelector("article .item-content").innerHTML = item.content;
            element.querySelector(".content").focus();

            //appbar.winControl.hideCommands([textSize, markItem]);


        }
    });

})();
 
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var userFavorites = new WinJS.Binding.List();

    function itemTemplateRenderer(itemPromise) {
        return itemPromise.then(function (currentItem) {
            var content;
            var templateClass = 'itemTextTemplate';

            if (currentItem.data.backgroundImage != null) {
                templateClass = 'itemMultimediaTemplate';
            }

            // Grab the default item template used on the groupeditems page.
            content = document.getElementsByClassName(templateClass)[0];
            var result = content.cloneNode(true);

            // need to implement logic on controlling the class name

            result.className = 'text';
            if (currentItem.data.backgroundImage != null) {
                result.className = 'media';
            }

            // Because we used a WinJS template, we need to strip off some attributes 
            // for it to render.
            result.attributes.removeNamedItem("data-win-control");
            result.attributes.removeNamedItem("style");
            result.style.overflow = "hidden";


            // Because we're doing the rendering, we need to put the data into the item.
            // We can't use databinding.

            result.getElementsByClassName("item-title")[0].textContent = currentItem.data.title;
            result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.domain;

            result.setAttribute('data-domain', currentItem.data.domain);
            result.setAttribute('data-url', currentItem.data.url);

            if (result.className === 'media') {
                result.getElementsByClassName("item-image")[0].src = currentItem.data.backgroundImage;
                result.getElementsByClassName("item-image")[0].alt = currentItem.data.title;
            }

            return result;
        });
    }

    function groupInfo() {
        return {
            enableCellSpanning: true,
            cellWidth: 350,
            cellHeight: 95
        };
    }

    WinJS.UI.Pages.define("/pages/favorites/favorites.html", {
        _items: null,

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            var listView = element.querySelector(".itemslist").winControl;
            GetAllData.getUserFeed("favorites",userFavorites);

            this._items = userFavorites;

            listView.itemDataSource = userFavorites.dataSource;
            listView.itemTemplate = itemTemplateRenderer;
            listView.oniteminvoked = this._itemInvoked.bind(this);

            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();

            var account = document.getElementById("accountUSer");
            WinJS.Binding.processAll(account, Kippt.account);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            this._items.splice(0, this._items.length);
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".itemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left", groupInfo: groupInfo });
            }
        },

        _itemInvoked: function (args) {
            var item = this._items.getAt(args.detail.itemIndex);
            nav.navigate("/pages/itemDetail/itemDetail.html", { item: item, via:"favorites" });
        }

    });
})();

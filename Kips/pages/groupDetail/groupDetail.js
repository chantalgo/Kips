(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var key;
    var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";
    var currentList = new WinJS.Binding.List();


    ui.Pages.define("/pages/groupDetail/groupDetail.html", {
        /// <field type="WinJS.Binding.List" />
        _items: null,

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            var listView = element.querySelector(".itemslist").winControl;
            var group = (options && options.groupKey) ? Data.resolveGroupReference(options.groupKey) : Data.groups.getAt(0);

            GetAllData.addtoFeed(group.key, currentList);

            Data.currentList = currentList;

            this._items = currentList;
    
            var pageList = this._items.createGrouped(
                function groupKeySelector(item) { return group.key; },
                function groupDataSelector(item) { return group; }
            );

            element.querySelector("header[role=banner] .pagetitle").textContent = group.title;

            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.groupDataSource = pageList.groups.dataSource;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();


            //Pop-Menu
            document.querySelector(".titlearea").addEventListener("click", showHeaderMenu, false);
            document.getElementById("collectionMenuItem").addEventListener("click", function () { goToSection("Collection"); }, false);
            document.getElementById("marketplaceMenuItem").addEventListener("click", function () { goToSection("Marketplace"); }, false);
            document.getElementById("newsMenuItem").addEventListener("click", function () { goToSection("News"); }, false);
            document.getElementById("homeMenuItem").addEventListener("click", function () { goHome(); }, false);
        },

        unload: function () {
            //this._items.dispose();
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
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left" });
            }
        },

        _itemInvoked: function (args) {
            var item = this._items.getAt(args.detail.itemIndex);
            WinJS.Navigation.navigate("/pages/itemDetail/itemDetail.html", { item: item });
        }
    });

    // Place the menu under the title and aligned to the left of it
    function showHeaderMenu() {
        var title = document.querySelector("header .titlearea");
        var menu = document.getElementById("headerMenu").winControl;
        menu.anchor = title;
        menu.placement = "bottom";
        menu.alignment = "left";

        menu.show();
    }

    // When navigating using the header menu for sections, change the subtitle to reflect the current pivot
    function goToSection(section) {
        WinJS.log && WinJS.log("You are viewing the " + section + " section.", "sample", "status");
    }

    // Hide the subtitle if no pivot is being used
    function goHome() {
        WinJS.log && WinJS.log("You are home.", "sample", "status");
    }
})();

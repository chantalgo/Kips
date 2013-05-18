// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

var appView = Windows.UI.ViewManagement.ApplicationView;
var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
var nav = WinJS.Navigation;
var ui = WinJS.UI;

(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/allLists/allLists.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var semanticZoom = element.querySelector("#zoom").winControl;
            var zoomedInListView = element.querySelector("#zoomedInListView").winControl;
            var zoomedOutListView = element.querySelector("#zoomedOutListView").winControl;

            zoomedOutListView.itemTemplate = element.querySelector(".zoomedInItemTemplate");
            zoomedInListView.itemTemplate = element.querySelector(".zoomedIntemTemplate");
            zoomedInListView.groupHeaderTemplate = element.querySelector(".headertemplate");



            zoomedInListView.itemDataSource = Data.groups.dataSource;
            zoomedInListView.groupDataSource = Data.letterItems.dataSource;
            zoomedInListView.layout = new ui.GridLayout({ groupHeaderPosition: "left" });



            zoomedOutListView.itemDataSource = Data.letterItems.dataSource;
            zoomedOutListView.groupDataSource = null;
            zoomedOutListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });

            semanticZoom.element.focus();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            /// <param name="viewState" value="Windows.UI.ViewManagement.ApplicationViewState" />
            /// <param name="lastViewState" value="Windows.UI.ViewManagement.ApplicationViewState" />

            var semanticZoom = element.querySelector("#zoom").winControl;
            var zoomedInListView = element.querySelector("#zoomedInListView").winControl;
            var itemTemplate = element.querySelector(".itemtemplate");

            if (appView.value === appViewState.snapped) {
                // If the app is snapped, configure the zoomed-in ListView
                // to show groups and lock the SemanticZoom control
                zoomedOutListView.itemDataSource = Data.groups.dataSource;
                zoomedInListView.layout = new ui.ListLayout();
                semanticZoom.locked = true;
                zoomedInListView.itemTemplate = element.querySelector(".zoomedOutItemTemplate");
            }

            else {
                // If the app isn't snapped, configure the zoomed-in ListView
                // to show items and groups and unlock the SemanticZoom control
                zoomedOutListView.itemDataSource = Data.groups.dataSource;
                zoomedInListView.layout = new ui.ListLayout();
                semanticZoom.locked = true;
                zoomedInListView.itemTemplate = element.querySelector(".zoomedOutItemTemplate");
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: item });
            }
        }
    });
})();

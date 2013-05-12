(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var semanticZoom = element.querySelector("#zoom").winControl;
            var zoomedInListView = element.querySelector("#zoomedInListView").winControl;
            var zoomedOutListView = element.querySelector("#zoomedOutListView").winControl;

            zoomedOutListView.itemTemplate = element.querySelector(".zoomedOutItemTemplate");
            zoomedOutListView.itemDataSource = Data.groups.dataSource;
            zoomedOutListView.groupDataSource = null;
            zoomedOutListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });

            zoomedInListView.groupHeaderTemplate = element.querySelector(".headertemplate");
            zoomedInListView.itemTemplate = element.querySelector(".itemtemplate");
            zoomedInListView.oniteminvoked = this._itemInvoked.bind(this);

            // disabling and hiding backbutton
            document.querySelector(".win-backbutton").disabled = true;
            // freeing navigation stack
            WinJS.Navigation.history.backStack = [];

            //set the Account Avatar to open the account settings bypassing the settings charm
            var account = document.getElementById("accountOpener");
            WinJS.Binding.processAll(account, Kippt.account);
            document.getElementById("openAccount").addEventListener("click", accountInfo, false);


            if (appView.value === appViewState.snapped) {
                // If the app is snapped, configure the zoomed-in ListView
                // to show groups and lock the SemanticZoom control
                zoomedInListView.itemDataSource = Data.groups.dataSource;
                zoomedInListView.groupDataSource = null;
                zoomedInListView.layout = new ui.ListLayout();
                semanticZoom.locked = true;
            }

            else {
                // If the app isn't snapped, configure the zoomed-in ListView
                // to show items and groups and unlock the SemanticZoom control
                zoomedInListView.itemDataSource = Data.items.dataSource;
                zoomedInListView.groupDataSource = Data.groups.dataSource;
                zoomedInListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
                semanticZoom.locked = false;
            }

            semanticZoom.element.focus();
},

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            /// <param name="viewState" value="Windows.UI.ViewManagement.ApplicationViewState" />
            /// <param name="lastViewState" value="Windows.UI.ViewManagement.ApplicationViewState" />

            var semanticZoom = element.querySelector("#zoom").winControl;
            var zoomedInListView = element.querySelector("#zoomedInListView").winControl;
            var itemTemplate = element.querySelector(".itemtemplate");

            if (appView.value === appViewState.snapped) {
                zoomedInListView.itemDataSource = Data.groups.dataSource;
                zoomedInListView.groupDataSource = null;
                zoomedInListView.itemTemplate = itemTemplate;
                zoomedInListView.layout = new ui.ListLayout();
                semanticZoom.zoomedOut = false;
                semanticZoom.locked = true;
            }
            else {
                zoomedInListView.itemDataSource = Data.items.dataSource;
                zoomedInListView.groupDataSource = Data.groups.dataSource;
                zoomedInListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
                semanticZoom.locked = false;

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

    function accountInfo() {
        WinJS.Application.onsettings = function (e) {
            e.detail.applicationcommands = { "defaults": { title: "Account Information", href: "/pages/settingsCharm/accountInfo/accountInfo.html" } };
            WinJS.UI.SettingsFlyout.populateSettings(e);
        };
        // Make sure the following is called after the DOM has initialized. Typically this would be part of app initialization
        WinJS.Application.start();

        WinJS.UI.SettingsFlyout.showSettings("defaults", "/pages/settingsCharm/accountInfo/accountInfo.html");
    }

})();

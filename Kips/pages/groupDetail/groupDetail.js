(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var key;
    var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";
    var currentList = new WinJS.Binding.List();
    var myDataSrc;
    var listView;

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

    ui.Pages.define("/pages/groupDetail/groupDetail.html", {
        /// <field type="WinJS.Binding.List" />
        _items: null,


        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var groupKey = options.groupKey;
            var group = (options && options.groupKey) ? Data.resolveGroupReference(groupKey) : Data.groups.getAt(0);
            listView = document.getElementById("listview1").winControl;
            listView.forceLayout();
            myDataSrc = new kipptClipsDataSource.datasource(groupKey);
            WinJS.Binding.processAll(document.getElementById("listInfo"), group);
            console.log();
            /*
            GetAllData.addtoFeed(group.key, currentList);

            Data.currentList = currentList;

            this._items = currentList;
    
            var pageList = this._items.createGrouped(
                function groupKeySelector(item) { return group.key; },
                function groupDataSelector(item) { return group; }
            );

            

            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = itemTemplateRenderer;
            listView.groupDataSource = pageList.groups.dataSource;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);
*/
            element.querySelector("header[role=banner] .pagetitle").textContent = group.title;
            WinJS.Binding.processAll(document.getElementById("listInfo"), group);
            listView.itemDataSource = myDataSrc;
            listView.itemTemplate = itemTemplateRenderer;
            listView.oniteminvoked = this._itemInvoked;



            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();

            this.populateMenu();
            
            listView.addEventListener("iteminvoked", itemInvokedHandler, false);
            //Pop-Menu
            document.querySelector(".titlearea").addEventListener("click", showHeaderMenu, false);
            document.getElementById("goHome").addEventListener("click", goHome, false);
        }
    
            ,

        unload: function () {
            //this._items.dispose();
            //this._items.splice(0, this._items.length);

        },

        //     // Populate the menu under the title
        populateMenu: function (){
            var menu = document.getElementById('headerMenu').winControl;
            for (var i = 0; i < Kippt.lists.meta.total_count; i++) {
                var list = Kippt.lists.objects[i];
                var mc = new WinJS.UI.MenuCommand(null, {
                    id: list.id, label: list.title, extraClass: 'caller', onclick: function () {
                        nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey:this.id });
                    }
                });
                menu._addCommand(mc);
            }
        },

        //     // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            //         /// <param name="element" domElement="true" />

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
                    if (firstVisible >= 0 && listView.itemDataSource.getCount > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        //     // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            //         /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left", groupInfo: groupInfo });
            }
        }
        //,

        //_itemInvoked: function (args) {
        //    var item = myDataSrc.getItem(args.detail.itemIndex);
        //    
        //}
        //} )
    }) ;

   // // Place the menu under the title and aligned to the left of it
   function showHeaderMenu() {
        var title = document.querySelector("header .titlearea");
        var menu = document.getElementById("headerMenu").winControl;
        menu.anchor = title;
        menu.placement = "bottom";
        menu.alignment = "left";

        menu.show();
    }

    function goHome() {
        nav.navigate("/pages/groupedItems/groupedItems.html");
    }
    function itemInvokedHandler(eventObject) {
        eventObject.detail.itemPromise.done(function (invokedItem) {
            nav.navigate("/pages/itemDetail/itemDetail.html", { item: invokedItem.data });

        });
    }

})();

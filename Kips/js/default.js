// For an introduction to the Grid template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=232446

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    var splash = null; // Variable to hold the splash screen object.
    var dismissed = false; // Variable to track splash screen dismissal status.
    var coordinates = { x: 0, y: 0, width: 0, height: 0 }; // Object to store splash screen image coordinates. It will be initialized during activation.
    var url;
    var vault = new Windows.Security.Credentials.PasswordVault();

    WinJS.Namespace.define("Kippt", {
        urlRoot: "https://kippt.com",
        username: "",
        token: "", 
        account: null,
        lists: null,
        blogPosts: null,
        limitedblogPosts: null
    })

    function deleteClip() {
        console.log(WinJS.Navigation.location);
        switch (WinJS.Navigation.location) {
            case "/pages/groupedItems/groupedItems.html":
                console.log();
                var listView = document.querySelector(".groupeditemslist").winControl;
                var count = listView.selection.count();
                if (count > 0) {
                    var items = listView.selection.getItems();
                    for (var i = 0; i < items._value.length; i++) {
                        var id = items._value[0].data.key;
                        GetAllData.deleteClip(id);
                        //Modify to pop ff listview
                        //var item = Data.items.getAt(id);
                        console.log(item);
                        //Push into promise array, and then join, and then return 
                    }
                } else {
                    //Nothing to delete!!
                    console.log("Nothing to delete");
                }
            case "/pages/groupDetail/groupDetail.html":

            case "/pages/itemDetail/itemDetail.html":

        }
    }

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Retrieve splash screen object
            splash = eventObject.detail.splashScreen;

            // Retrieve the window coordinates of the splash screen image.
            coordinates = splash.imageLocation;

            // Register an event handler to be executed when the splash screen has been dismissed.
            splash.addEventListener("dismissed", onSplashScreenDismissed, false);

            // Create and display the extended splash screen using the splash screen object.
            ExtendedSplash.show(splash);

            // Listen for window resize events to reposition the extended splash screen image accordingly.
            // This is important to ensure that the extended splash screen is formatted properly in response to snapping, unsnapping, rotation, etc...
            window.addEventListener("resize", onResize, false);

            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                // Navigate to either the first scenario or to the last running scenario
                // before suspension or termination.

                document.getElementById("goHome").onclick = goHome;
                document.getElementById("goFeed").onclick = goFeed;
                document.getElementById("goFavorites").onclick = goFavorites;
                //document.getElementById("goAllLists").onclick = goAllLists;


                //document.getElementById("deleteClip").onclick = Appbar.deleteClip;
                document.getElementById("addClip").onclick = addClip;
                //document.getElementById("addNote").onclick = addNote;
                //document.getElementById("addList").onclick = addList;
                //document.getElementById("editClip").onclick = editClip;


            }));
        }
    }

    function onSplashScreenDismissed() {
        // Include code to be executed when the system has transitioned from the splash screen to the extended splash screen (application's first view).
        try {
            var creds = vault.findAllByResource("Kips");
            autoLogin(vault, creds);
        }

        catch (e) {
            var extendedSplashScreen = document.getElementById("extendedSplashScreen");
            WinJS.Utilities.addClass(extendedSplashScreen, "hidden");
            WinJS.Navigation.navigate("/pages/login/login.html");
        }

        console.log();

    }

    function onResize() {
        // Safely update the extended splash screen image coordinates. This function will be fired in response to snapping, unsnapping, rotation, etc...
        if (splash) {
            // Update the coordinates of the splash screen image.
            coordinates = splash.imageLocation;
            ExtendedSplash.updateImageLocation(splash);
        }
    }

    WinJS.Namespace.define("Appbar", {
        deleteClip: deleteClip
    })

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };


    function autoLogin(vault, creds) {
        console.log("autoLogin");
        creds = vault.findAllByResource("Kips");
        Kippt.username = creds.getAt(0).userName;
        Kippt.token = vault.retrieve("Kips", Kippt.username).password;

        var promiseArray= [];

        promiseArray[0] = WinJS.xhr({
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot + "/api/account/?include_data=api_token"
        }).then(
       function completed(r) {
           Kippt.account = JSON.parse(r.responseText);
       },
       function error(r) {
       },
       function progress(r) {
           document.getElementById("extendedSplashText").innerText="Getting account Information";
       });
        

         promiseArray[1] = WinJS.xhr({
             headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
             url: Kippt.urlRoot + "/api/lists/?limit=200"
         }).then(
         function completed(r) {
             Kippt.lists = JSON.parse(r.responseText);
         },
         function error(r){
         },
         function progress(r){
             document.getElementById("extendedSplashText").innerText="Getting list Information";
         }
         );

         WinJS.Promise.join(promiseArray).done(function () {
             var extendedSplashScreen = document.getElementById("extendedSplashScreen");
             WinJS.Utilities.addClass(extendedSplashScreen, "hidden");
             WinJS.Navigation.navigate("/pages/groupedItems/groupedItems.html");
         });

    }

    function addList() {
        showFlyout(confirmFlyout, appbar, "right");
    };

    function showFlyout(flyout, anchor, placement) {
        flyout.winControl.show(anchor, placement);
    }

    function goHome() {
        nav.navigate("/pages/groupedItems/groupedItems.html");
    }
    
    function goFeed() {
        nav.navigate("/pages/feed/feed.html");
    }

    function goFavorites() {
        nav.navigate("/pages/favorites/favorites.html");
    }
    
    /*function goAllLists() {
        nav.navigate("/pages/allLists/allLists.html");
    }
*/
    app.addEventListener("activated", activated, false);
    app.start();
})();

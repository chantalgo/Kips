﻿// For an introduction to the Grid template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=232446

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

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

    WinJS.Namespace.define("Appbar", {
        deleteClip: deleteClip
    })
    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.


                document.getElementById("goHome").onclick = goHome;
                document.getElementById("goFeed").onclick = goFeed;
                document.getElementById("goFavorites").onclick = goFavorites;
                //document.getElementById("goAllLists").onclick = goAllLists;


                document.getElementById("deleteClip").onclick = Appbar.deleteClip;
                document.getElementById("addClip").onclick = addClip;
                document.getElementById("addNote").onclick = addNote;
                document.getElementById("addList").onclick = addList;
                document.getElementById("editClip").onclick = editClip;

            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }).done(function () {
                var vault = new Windows.Security.Credentials.PasswordVault();

                try {
                    var creds = vault.findAllByResource("Kips");
                    autoLogin(vault, creds);
                }
                catch (e) {
                    var login = document.getElementById("login");
                    login.addEventListener("click", loginToken, false);

                }
               

            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    function loginToken(mouseEvent) {

        Kippt.username = document.getElementById('username').value;
        var kipptPassword = document.getElementById('password').value;

        try {
            if (document.getElementById('username').value === "" || document.getElementById('password').value === "") {
                console.log("BLANK!");
                throw new Error("Please enter a username and password.");
            }

            var promiseArray=[];

            promiseArray[0]=WinJS.xhr({
                user: Kippt.username,
                password: kipptPassword,
                url: Kippt.urlRoot + "/api/account/?include_data=api_token"
            }).then(function (r) {
                Kippt.account = JSON.parse(r.responseText);
                Kippt.token = Kippt.account.api_token;});

            promiseArray[1]= WinJS.xhr({
                user: Kippt.username,
                password: kipptPassword,
                url: Kippt.urlRoot + "/api/lists/?limit=200"
            }).then(function (r) {
                Kippt.lists = JSON.parse(r.responseText);
            });

            WinJS.Promise.join(promiseArray).done( function (){
                    var vault = new Windows.Security.Credentials.PasswordVault();
                    var cred = new Windows.Security.Credentials.PasswordCredential("Kips", Kippt.username, Kippt.token);
                    vault.add(cred);
                    WinJS.Navigation.navigate("/pages/groupedItems/groupedItems.html");
                })
        }
        catch (e) { };
    };

    function autoLogin(vault, creds) {

        creds = vault.findAllByResource("Kips");
        Kippt.username = creds.getAt(0).userName;
        Kippt.token = vault.retrieve("Kips", Kippt.username).password;

        var promiseArray= [];

        promiseArray[0] = WinJS.xhr({
            headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
            url: Kippt.urlRoot + "/api/account/?include_data=api_token"
        }).done(
       function completed(r) {
           Kippt.account = JSON.parse(r.responseText);
       },
       function error(r) {
       },
       function progress(r) {
           console.log("process");
       });
        

         promiseArray[1] = WinJS.xhr({
             headers: { "X-Kippt-Username": Kippt.username, "X-Kippt-API-Token": Kippt.token },
             url: Kippt.urlRoot + "/api/lists/?limit=200"
         }).then(function (r) {
             Kippt.lists = JSON.parse(r.responseText);
         });

         WinJS.Promise.join(promiseArray).done( function () {
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

    app.start();
})();

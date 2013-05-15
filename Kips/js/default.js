// For an introduction to the Grid template, see the following documentation:
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

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.

                document.getElementById("deleteList").onclick = deleteList;
                document.getElementById("deleteClip").onclick = deleteClip;
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

    // The click event handler for button1
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
        showFlyout(confirmFlyout, appbar, "left");
    };

    function showFlyout(flyout, anchor, placement) {
        flyout.winControl.show(anchor, placement);
    }
    app.start();
})();

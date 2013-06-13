(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/login/login.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            var login = document.getElementById("login");
            login.addEventListener("click", loginToken, false);

        },


        unload: function () {
            // TODO: Respond to navigations away from this page.


        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }



    });


    function loginToken(mouseEvent) {
        console.log("loginToken");
        Kippt.username = document.getElementById('username').value;
        var kipptPassword = document.getElementById('password').value;

        try {
            if (document.getElementById('username').value === "" || document.getElementById('password').value === "") {
                console.log("BLANK!");
                throw new Error("Please enter a username and password.");
            }

            var promiseArray = [];

            var loginProgress = document.getElementById("loginProgress");
            WinJS.Utilities.removeClass(loginProgress, "hidden");
            WinJS.Utilities.addClass(loginProgress, "visible");

            promiseArray[0] = WinJS.xhr({
                user: Kippt.username,
                password: kipptPassword,
                url: Kippt.urlRoot + "/api/account/?include_data=api_token"
            }).then(
            function onComplete(r) {
                Kippt.account = JSON.parse(r.responseText);
                Kippt.token = Kippt.account.api_token;
            },
            function onError(r) { },
            function onProgress(r) {

            }
            );

            promiseArray[1] = WinJS.xhr({
                user: Kippt.username,
                password: kipptPassword,
                url: Kippt.urlRoot + "/api/lists/?limit=200"
            }).then(function (r) {
                Kippt.lists = JSON.parse(r.responseText);
            });

            WinJS.Promise.join(promiseArray).done(function () {
                var vault = new Windows.Security.Credentials.PasswordVault();
                var cred = new Windows.Security.Credentials.PasswordCredential("Kips", Kippt.username, Kippt.token);
                vault.add(cred);
                WinJS.Navigation.navigate("/pages/groupedItems/groupedItems.html");
            },
            function () { },
            function () {

            })

        }
        catch (e) { };
    };
})();

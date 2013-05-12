// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/settingsCharm/accountInfo/accountInfo.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            Kippt.account.twitter_url = "http://www.twitter.com/" + Kippt.account.twitter;
            Kippt.account.github_url = "http://www.github.com/" + Kippt.account.github;
            Kippt.account.dribble_url = "http://www.dribbble.com/" + Kippt.account.dribbble;

            var settingFlyout = document.getElementById("accountInfoFlyout");
            WinJS.Binding.processAll(settingFlyout, Kippt.account);

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();

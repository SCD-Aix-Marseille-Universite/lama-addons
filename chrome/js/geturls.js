/**
 * Fetch the URL domains
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

browser.runtime.onInstalled.addListener(function() {
    validateCacheEzProxy();
});

browser.runtime.onStartup.addListener(function() {
    validateCacheEzProxy();
});

function validateCacheEzProxy() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function(e) {
        // Alert on URL update (delete on prod)
        console.log("refresh urlsToProxy");
        // We get the json for this extension, we can save it as storage
        urlsToProxy = JSON.parse(oReq.response);
    };
    // Get URL list ezproxy/pages/public/urls.json
    oReq.open("get", "http://lama.univ-amu.fr/public/urls.json", true);
    oReq.send();
}
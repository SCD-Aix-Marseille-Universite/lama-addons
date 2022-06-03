/**
 * Fetch the URL domains
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

browser.runtime.onInstalled.addListener(function() {
    validateCacheEzProxy();
    chrome.alarms.create("refreshProxyList", {
        "periodInMinutes":  10,
        "delayInMinutes": 2
    });
});

browser.runtime.onStartup.addListener(function() {
    validateCacheEzProxy();
    chrome.alarms.create("refreshProxyList", {
        "periodInMinutes":  10,
        "delayInMinutes": 2
    });
});

browser.runtime.onConnect.addListener(function() {
    validateCacheEzProxy();
    chrome.alarms.create("refreshProxyList", {
        "periodInMinutes":  10,
        "delayInMinutes": 2
    });
});

chrome.alarms.onAlarm.addListener(function() {
    validateCacheEzProxy();
});

function validateCacheEzProxy() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function(e) {
        // Alert on URL update
        console.log("refresh urlsToProxy");
        // We get the json for this extension, we can save it as storage
        urlsToProxy = JSON.parse(oReq.response);
    };
    // Get URL list ezproxy/pages/public/urls.json
    oReq.open("get", "https://lama.univ-amu.fr/public/urls.json", true);
    oReq.send();
}
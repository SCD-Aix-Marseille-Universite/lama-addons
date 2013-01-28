const DEFAULT_BASE_URL = "http://lama.univ-amu.fr/login?url=$@";

function transformUrl(url) {
    var base = localStorage["base_url"];
    if (!base) {
        base = localStorage["base_url"] = DEFAULT_BASE_URL;
    }

    if (base.indexOf("$@") >= 0) {
        return base.replace("$@", url);
    }
    return base;
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.update(tab.id, {"url": transformUrl(tab.url)});
});
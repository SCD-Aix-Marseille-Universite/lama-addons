/**
 * this page will listen to things that interest us
 * in practice that means: whenever the URL of the page changes
 * if it does: check if it is in the list of URLs to proxy
 * if yes: show notification  
 * and show a login button on the popup screen
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

/**
 * Build the redirect URL
 *
 * @param url
 * @returns {string}
 */
var getRedirectUrl = function(url) {
    //url to the login page
    var proxy = "https://lama.univ-amu.fr/login?qurl=";

    /**
     * Special cases
     */
    //off campus access to WebOfKnowledge will send you to a login page that can't be proxied
    //so redirect to proxied start page
    if (url.indexOf('login.webofknowledge.com') > -1) {
        url = 'http://apps.webofknowledge.com';
    }
    return proxy + encodeURIComponent(url);
};

/**
 * urlsList is defined in urls.min.js
 * edit that list to reflect your institutions licenses
 *
 * @type {Array}
 */
// var urlsToProxy = urlsList;

/**
 * Determine the domain (which you can then check agains urls.min.js)
 */
function getDomain(url) {
    var doubleSlash = url.indexOf('//');
    var unHttp = url.substr(doubleSlash + 2);
    var domainSlash = unHttp.indexOf('/');
    var domain = unHttp.substr(0, domainSlash);

    return domain;
}

/**
 * function to see if the url can be proxied
 *
 * @param searchUrl
 * @param callback
 */
function getProxied(searchUrl, callback) {
    var toProxy = '';
    var doubleslash = searchUrl.indexOf('//');
    var unhttp = searchUrl.substr(doubleslash + 2);
    var domainslash = unhttp.indexOf('/');
    var domain = unhttp.substr(0, domainslash);

    if (domain.indexOf('.') === -1) {
        return null;
    }

    var tldomain = domain.match(/[\w]+\.[\w]+$/)[0];
    var parentDomain = domain.substr(domain.indexOf('.') + 1);

    /**
     * Save in storage
     */
    // Check if we are browsing a site via the proxy
    saveStorageOnProxy(domain.indexOf('lama.univ-amu.fr') !== -1);

    if (urlsToProxy.indexOf(domain) != -1 || urlsToProxy.indexOf(parentDomain) != -1 || urlsToProxy.indexOf('www.' + parentDomain) != -1) {
        toProxy = 'yes';
        saveStorageToProxy('yes');
        callback(toProxy);
    } else {
        toProxy = 'no';
        saveStorageToProxy('no');
        callback(toProxy);
    }
}

/**
 * Initalize storage values
 *
 */
function saveStorageQualify(value) {
    localStorage['qualify'] = value;
}

function saveStorageToProxy(value) {
    localStorage['toproxy'] = value;
}

function saveStorageOnProxy(value) {
    localStorage['onproxy'] = (value == true) ? 'on' : 'off';
}

function saveStorageNotificationType(value) {
    localStorage['notetype'] = value;
}

function getUserPreferences(callback) {
    browser.storage.sync.get({
            showNotification: true,
        },
        function(items) {
            callback(items);
        });
}

/**
 * This is where the main logic happens
 * We depending on the page's domain 
 * we determine whether we should change the extension icon, 
 * show a login button in the pop-up and, depending on the user's
 * preferences, an inpage notification
 * 
 * @param checkResult
 * @param url
 * @param tabId
 * @param userPreferences
 */
function checkRedirect(checkResult, url, tabId, userPreferences) {

    if (checkResult == 'yes') {
        // Record a visit on a detected site

        //change to icon to "on"
        browser.browserAction.setIcon({ path: { "18": "img/64-go.png" } });

        //we want to make the login button visible in the icon popup
        //we can't send a message, because the popup may not be active
        //instead, let's try setting something in localstorage
        saveStorageQualify('yes');

        //if the user has notifications on
        //show notification
        if (userPreferences.showNotification) {
            saveStorageNotificationType('mini');
            browser.tabs.executeScript(tabId, {
                    code: 'var notetype="mini";'
                },
                function() {
                    browser.tabs.executeScript(tabId, { file: "js/content.js" }, function() {});
                });
        }; //end of if shownotification
    } //end
    else if (localStorage['onproxy'] == 'on') {
        //if you are on the proxy, show a "green" icon
        browser.browserAction.setIcon({ path: { "18": "img/64-on.png" } });
    } else {
        saveStorageQualify('no');
        browser.browserAction.setIcon({ path: { "18": "img/64-no.png" } });
    }
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    browser.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];

        if (typeof(tab) === 'undefined') {
            return;
        }

        var url = tab.url;
        callback(url);

    });
}

/**
 * Start: do this whenever the browser requests a page
 *
 */
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {


    if (changeInfo.status === 'complete') {
        var url = tab.url;

        //start by setting all local storage variables to null
        saveStorageQualify(null);
        saveStorageToProxy(null);
        saveStorageOnProxy(null);

        getProxied(url, function(checkResult) {
            getUserPreferences(function(userPreferences) {
                checkRedirect(checkResult, url, tabId, userPreferences);
            });
        });
    }
});


/**
 * Called when the user switches to the current tab
 */
browser.tabs.onActivated.addListener(function(activeInfo) {
    // Set default icon for new tab
    browser.browserAction.setIcon({ path: { "18": "img/64-no.png" } });

    //start by setting all local storage variables to null
    saveStorageQualify(null);
    saveStorageToProxy(null);
    saveStorageOnProxy(null);

    getCurrentTabUrl(function(url) {
        getProxied(url, function(checkResult) {
            getUserPreferences(function(userPreferences) {
                checkRedirect(checkResult, url, activeInfo.tabId, userPreferences);
            });
        });
    });
});

/**
 * function if user has clicked on "connexion" menu entry
 * The user is redirected to the the appropriate page, 
 * usually one where they can log in to gain access 
 */
browser.notifications.onButtonClicked.addListener(function(ntId, btnIdx) {
    if (ntId == myNotificationID && btnIdx === 0) {

        //go to current tab, find that url and redirect
        getCurrentTabUrl(function(url) {
            var redirectUrl = getRedirectUrl(url);

            browser.tabs.update({ url: redirectUrl });
        });
    }
});
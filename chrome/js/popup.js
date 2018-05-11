/**
 *
 * Code behind the popup page
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

var getRedirectUrl = browser.extension.getBackgroundPage().getRedirectUrl;

/**
 * Get the current URL
 */
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    browser.tabs.query(queryInfo,
        function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
            callback(url);
        });
}

/**
 * Determine which elements on the page to show
 */
document.addEventListener('DOMContentLoaded',
    function() {
        var qualify = localStorage['qualify'],
            toProxy = localStorage['toproxy'],
            onProxy = localStorage['onproxy'];

        if (onProxy == 'on') {
            $('#on-proxy').show();
            $('#no-proxy').hide();
            $('#proxy').hide();
        } else {
            $('#on-proxy').hide();

            //only show the button if we have a redirect url
            if (getRedirectUrl != '') {
                if (toProxy == "yes") {
                    document.getElementById('proxy').style.display = "block";
                    document.getElementById('no-proxy').style.display = "none";
                } else {
                    document.getElementById('proxy').style.display = "none";
                    document.getElementById('no-proxy').style.display = "block";
                }

                if (qualify == 'yes') {
                    document.getElementById("popup_login").classList.add("button-green");
                    document.getElementById("popup_login").removeAttribute('disabled');

                    getCurrentTabUrl(function(url) {
                        document.getElementById("popup_login").href = getRedirectUrl(url);
                    });
                } else {
                    document.getElementById("popup_login").classList.remove("button-green");
                    document.getElementById("popup_login").setAttribute('disabled', 'disabled');
                }
            } else {
                document.getElementById("popup_login").classList.remove("button-green");
                document.getElementById("popup_login").setAttribute('disabled', 'disabled');
            }
        }
    });

/**
 * Listen to the login menu entry
 */
document.getElementById("popup_login").addEventListener("click",
    function() {
        getCurrentTabUrl(function(url) {});

        var redirectUrl = document.getElementById("popup_login").href;

        browser.tabs.update({ url: redirectUrl });
        window.close();
    });

/**
 * Listen to the options entry
 */
document.getElementById("go-to-options").addEventListener("click",
    function() {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else {
            window.open(browser.runtime.getURL('options.html'));
        }
    });

/**
 * Listen others menu entries
 */
document.getElementById("summon").addEventListener("click",
    function() {
        browser.tabs.create({ url: "https://univ-amu.summon.serialssolutions.com/#!/" })
    }
)
document.getElementById("az").addEventListener("click",
    function() {
        browser.tabs.create({ url: "https://sh2hh6qx2e.search.serialssolutions.com/" })
    }
)
document.getElementById("about").addEventListener("click",
    function() {
        browser.tabs.create({ url: "https://scd-aix-marseille-universite.github.io/lama-addons/" })
    }
)
/**
 * Build the redirect URL
 *
 * @param url
 * @returns {string}
 */
var getRedirectUrl = function(url) {
    //The URL to the relevant login page. The one for the AMU proxy is shown below as an example
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
 * Get the current Url
 */
function getCurrentTabUrl(callback) {
    var url = window.location.search;
    var use_url = url.substring(1);
    console.log("URL :" + url);
    console.log("URL used :" + use_url);
    callback(use_url);
}
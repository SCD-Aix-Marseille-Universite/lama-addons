/**
 * Create an iframe with the notification
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

//check if iframe is already present
if (document.getElementById("lama_notification_frame")) {
    //do nothing
} else {
    var url = window.location.href;
    var iframe = document.createElement('iframe');
    iframe.id = 'lama_notification_frame';
    iframe.className = 'css-lama-notification';
    iframe.frameBorder = 0;
    iframe.style.position = "fixed";
    iframe.style.bottom = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = 1000;
    iframe.style.width = "65px";
    iframe.style.height = "65px";
    iframe.src = browser.extension.getURL("notification.html?" + url);
    document.body.appendChild(iframe);
}

/**
 * Listen to events in the iframe
 */
browser.runtime.onMessage.addListener(function(message) {
    iframe.style.display = 'none';
    if (message.demand && message.demand == 'redirect') {
        var newUrl = message.text;
        window.location.href = newUrl;
    }
    if (message.demand && message.demand == 'hide_popup') {
        iframe.style.display = 'none';
    }
});
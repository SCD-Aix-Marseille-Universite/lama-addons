/**
 *
 * This listens to events on the notification pages and sends them to the event page
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

browser.runtime.onMessage.addListener(function(message, sender) {
    browser.tabs.sendMessage(sender.tab.id, message);
});
/**
 * Save options
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

function save_options() {
    var doNotification = document.getElementById('notification').checked;
    var doSmash = document.getElementById('smash').checked;

    browser.storage.sync.set({
            showNotification: doNotification,
            showsmash: doSmash
        },
        function() {
            //update status to let user know the options were saved
            var status = document.getElementById('status');
            status.innerHTML = '<div>Pr&eacute;f&eacute;rences sauvegard&eacute;es.</div>';
            setTimeout(function() {
                status.innerHTML = '';
            }, 1000);
        });
}

/**
 * Show checkbox state using stored preferences
 */
function restore_options() {
    //use default true
    browser.storage.sync.get({
            showNotification: true,
        },
        function(items) {
            document.getElementById('notification').checked = items.showNotification;
        });
    browser.storage.sync.get({
            showsmash: true,
        },
        function(items) {
            document.getElementById('smash').checked = items.showsmash;
        });
}

/**
 * Load stored preferences on start
 */
document.addEventListener('DOMContentLoaded', restore_options);

/**
 * Listen to the 'notification' and 'smash' buttons
 */
document.getElementById('notification').addEventListener('click', save_options);
document.getElementById('smash').addEventListener('click', save_options);

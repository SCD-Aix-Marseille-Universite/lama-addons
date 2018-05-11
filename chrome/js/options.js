/**
 * Save options
 */
if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

function save_options() {
    var doNotification = document.getElementById('notification').checked;

    browser.storage.sync.set({
            showNotification: doNotification,
        },
        function() {
            //update status to let user know the options were saved
            var status = document.getElementById('status');
            status.innerHTML = '<div>pr&eacute;f&eacute;rences sauvegard&eacute;es</div>';
            setTimeout(function() {
                status.innerHTML = '';
            }, 750);
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
}

/**
 * Load stored preferences on start
 */
document.addEventListener('DOMContentLoaded', restore_options);

/**
 * Listen to the 'notification' button
 */
document.getElementById('notification').addEventListener('click', save_options);

/**
 * Start
 */
$(document).ready(function() {
    browser.storage.sync.get({
            npsrecorded: 0
        },
        function(items) {
            var display = items.npsrecorded === 1 ? 'none' : 'block';
            $('#nps-info').css('display', display);
        });
});
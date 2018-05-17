/**
 * Show the relevant parts of the notification
 */
document.addEventListener('DOMContentLoaded', function() {
    var qualify = localStorage['qualify'],
        toProxy = localStorage['toproxy'],
        onProxy = localStorage['onproxy'],
        noteType = localStorage['notetype'];

    if (onProxy == 'on') {
        $('#proxy').hide();
    } else {
        if (toProxy == "yes" && qualify == "yes") {
            document.getElementById('proxy').style.display = "block";
        } else {
            document.getElementById('proxy').style.display = "none";
        }
        if (qualify == 'yes') {
            document.getElementById("small_note_loginbutton").style.display = "block";
            getCurrentTabUrl(function(url) {
                document.getElementById("small_note_loginbutton").href = getRedirectUrl(url);
            });
        } else {
            document.getElementById("small_note_loginbutton").style.display = "none";
        }
    }
});

/**
 * Listen to the login menu entry
 */
document.getElementById("small_note_loginbutton").addEventListener("click", function() {
    getCurrentTabUrl(function(url) {});

    var redirectUrl = document.getElementById("small_note_loginbutton").href;

    chrome.runtime.sendMessage({
        demand: "redirect",
        text: redirectUrl
    });
});
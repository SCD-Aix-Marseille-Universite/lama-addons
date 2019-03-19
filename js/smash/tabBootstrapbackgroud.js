if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}


browser.runtime.onConnect.addListener(function (port) {

  port.onMessage.addListener(function (page) {
    
//    if (!isContentTypeAllowed(page.contentType)
//      ) return;
    browser.tabs.executeScript(port.sender.tab.id, { file: '/js/vendors/jquery.min.js' });
    browser.tabs.executeScript(port.sender.tab.id, { file: '/js/smash/smash.js' });
  });
});

function isContentTypeAllowed(contentType) {
  var forbidenContentTypes = [
    'application/xml',
    'text/xml'
  ];

  return !~forbidenContentTypes.indexOf(contentType);
}

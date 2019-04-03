if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

var blackList = [
  'catalogue.univ-amu.fr',
  'sh2hh6qx2e.search.serialssolutions.com',
  'univ-amu.summon.serialssolutions.com',
],
  blackListPatterns = blackList.map(compileUrlPattern)
  ;

browser.runtime.onConnect.addListener(function (port) {

  port.onMessage.addListener(function (page) {
    
    if (!isContentTypeAllowed(page.contentType) || !isBlackListed(port.sender.url)
    ) return;
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

function isBlackListed(url) {
  for (var i = 0; i < blackListPatterns.length; ++i) {
    if (url.match(blackListPatterns[i])) {
      return false;
    }
  }
  return true;
}

function escapeStringForRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function compileUrlPattern(url) {
  return new RegExp(
    escapeStringForRegex(url).replace('\\*', '.*'),
    'i'
  );
}
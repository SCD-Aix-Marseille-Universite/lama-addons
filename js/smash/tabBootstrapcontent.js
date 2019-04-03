if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

var port = browser.runtime.connect(),
    page = {
      contentType: window.document.contentType
    }
  ;

port.postMessage(page);

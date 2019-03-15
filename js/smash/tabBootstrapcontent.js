'use strict';
var browser = chrome || browser;
var port = browser.runtime.connect(),
    page = {
      contentType: window.document.contentType
    }
  ;

port.postMessage(page);

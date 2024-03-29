if (typeof chrome !== "undefined" && chrome) {
    browser = chrome
}

var SMASHLinkInserter;

const forbidenElements = ['applet',
  'area',
  'audio',
  'br',
  'canvas',
  'center',
  'embed',
  'frame',
  'frameset',
  'hr',
  'iframe',
  'img',
  'input',
  'keygen',
  'link',
  'map',
  'meta',
  'meter',
  'noframes',
  'noscript',
  'object',
  'optgroup',
  'option',
  'output',
  'param',
  'picture',
  'progress',
  'script',
  'select',
  'source',
  'textarea',
  'time',
  'track',
  'video',
  'wbr',
  'svg',
  'g',
  'path',
  'text',
  'rect'];

SMASHLinkInserter = {
  // OpenURL static info
  openUrlVersion: 'Z39.88-2004',
  openURLPrefix: 'https://sh2hh6qx2e.search.serialssolutions.com/?',

  // DOI pattern
  doiPattern: /((dx\.)?doi\.org|doi\.acm\.org|dx\.crossref\.org|(dx\-)?doi-org.lama.univ-amu.fr).*\/(10\..*(\/|%2(F|f)).*)/,
  // the index of the group where to find the DOI
  doiGroup: 4,
  regexDoiPatternConservative: new RegExp('(10\\.\\d{4,5}\\/[\\S]+[^;,.\\s])', 'gi'),

  // PMID
  pubmedPattern: new RegExp('(|http.*\\/\\/).*ncbi\\.nlm\\.nih\\.gov.*\\/pubmed.*(\\/|=)([0-9]{4,12})', 'i'),
  pubmedGroup: 2,
  regexPMIDPattern: new RegExp('(PubMed\\s?(ID\\s?:?|:)|PM\\s?ID)[\\s:\\/]?\\s*([0-9]{4,12})', 'gi'),
  regexPrefixPMIDPattern: new RegExp('((PubMed\\s?(ID)?:?)|(PM\\s?ID))[\\s:\\/]*$', 'i'),
  regexSuffixPMIDPattern: new RegExp('^\\s*[:\\/]?\\s*([0-9]{4,12})', 'i'),
  skipPattern: new RegExp('^[:\\/\\s]+$', 'i'),

  // The last group should be the parameters for openurl resolver
  openUrlPattern: /.*(sh2hh6qx2e).*(serialssolutions).com.*(\/|%2(F|f))?\?*(.*)/,
  flags: {
    OPEN_URL_BASE: 1,
    DOI_ADDRESS: 2,
    PUBMED_ADDRESS: 3,
    HAS_OPEN_URL: 4,
  },

  onDOMContentLoaded: function () {
    var rootElement = document.documentElement;
    // check if we have an html page
    if (document.contentType === 'text/html') {
      var currentUrl = window.location.href;
      SMASHLinkInserter.findAndReplaceLinks(rootElement);
    }

  },

  scanForDoiAndPubmedStrings: function (domNode, prefixStatus) {
    var prefix = prefixStatus;
    // Only process valid dom nodes:
    if (domNode === null || !domNode.getElementsByTagName) {
      return prefix;
    }

    if (forbidenElements.includes(domNode.tagName.toLowerCase())) return false;

    // if the node is already clickable
    if (domNode.tagName.toLowerCase() === 'a') {
      return false;
    }

    var childNodes = domNode.childNodes,
      childNode,
      spanElm,
      i = 0,
      text
      ;

    while ((childNode = childNodes[i])) {
      if (childNode.nodeType === 3) { // text node found, do the replacement
        text = childNode.textContent;
        if (text) {
          var matchDOI = text.match(this.regexDoiPatternConservative);
          var matchPMID = text.match(this.regexPMIDPattern);
          if (matchDOI || matchPMID) {
            spanElm = document.createElement('span');
            spanElm.setAttribute('name', 'SMASHInserted');

            if (matchDOI) {
              spanElm.innerHTML = text.replace(this.regexDoiPatternConservative,
                '<a href="http://dx.doi.org/$1" name="SMASHInserted">$1</a>');
              text = spanElm.innerHTML;
            }
            if (matchPMID) {
              spanElm.innerHTML =
                text
                  .replace(this.regexPMIDPattern,
                    '<a href="http://www.ncbi.nlm.nih.gov/pubmed/$3" name="SMASHInserted">PubMed ID $3</a>'
                  );
            }
            domNode.replaceChild(spanElm, childNode);
            childNode = spanElm;
            text = spanElm.innerHTML;
            prefix = false;
          }
          else {
            if (prefix && (text.match(this.regexSuffixPMIDPattern))) {
              //debug('regexSuffixPMIDPattern: ' + text);
              spanElm = document.createElement('span');
              spanElm.setAttribute('name', 'SMASHInserted');
              spanElm.innerHTML = text.replace(this.regexSuffixPMIDPattern,
                '<a href=\'http://www.ncbi.nlm.nih.gov/pubmed/$1\' name=\'SMASHInserted\'>$1</a>');
              domNode.replaceChild(spanElm, childNode);
              childNode = spanElm;
              text = spanElm.innerHTML;
              prefix = false;
            }
            else if (text.match(this.regexPrefixPMIDPattern)) {
              //debug('regexPrefixPMIDPattern: ' + text);
              prefix = true;
            }
            else if (text.length > 0) {
              if (!text.match(this.skipPattern)) {
                prefix = false;
              }
            }
          }
        }
      }
      else if (childNode.nodeType === 1) { // not a text node but an element node, we look forward
        prefix = this.scanForDoiAndPubmedStrings(childNode, prefix);
      }
      i++;
    }
    return prefix;
  },

  findAndReplaceLinks: function (domNode) {
    // Only process valid domNodes:
    if (!domNode || !domNode.getElementsByTagName) return;

    this.scanForDoiAndPubmedStrings(domNode, false);

    // Detect OpenURL, DOI or PII links not already handled in the code above and replace them with our custom links
    var links = domNode.getElementsByTagName('a');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var flags = this.analyzeLink(link);

      if (flags === 0) {
        continue;
      }

      var href = decodeURIComponent(link.getAttribute('href'));

      // We have found an open url link:
      if (flags === this.flags.HAS_OPEN_URL) {
        // OpenURl
        this.createOpenUrlLink(href, link);
      }
      else if (flags === this.flags.DOI_ADDRESS) {
        // doi
        this.createDoiLink(href, link);
      }
      else if (flags === this.flags.PUBMED_ADDRESS) {
        // PubMed ID
        this.createPubmedLink(href, link);
      }

    }

    this.createSpanBasedLinks(domNode);
  },

  analyzeLink: function (link) {
    // First check if we have to bother:
    var mask = 0;

    if (!link.getAttribute('href')) {
      return mask;
    }

    var href = link.getAttribute('href');
    var currentUrl = window.location.href;
    if (link.getAttribute('name') === 'SMASHVisited') {
      return mask;
    }
    if (link.getAttribute('classname') === 'smash-link') {
      return mask;
    }

    if ((href.indexOf('doi.org') !== -1 ||
      href.indexOf('doi.acm.org') !== -1 ||
      href.indexOf('dx.crossref.org') !== -1)
      && href.match(this.doiPattern)) {
      // Check if the href contains a DOI link
      mask = this.flags.DOI_ADDRESS;
    } else if (href.indexOf('ncbi.nlm.nih.gov') !== -1 && this.pubmedPattern.test(href)) {
      // Check if the href contains a PMID link
      mask = this.flags.PUBMED_ADDRESS;
    } else if (href.indexOf('serialssolutions.com') !== -1 && this.openUrlPattern.test(href)) {
      if (link.getAttribute('class') !== 'documentLink') {
        mask = this.flags.OPEN_URL_BASE;
      }
    }

    return mask;
  },

  createOpenUrlLink: function (href, link) {
    var matchInfo = this.openUrlPattern.exec(href);
    if (!matchInfo) return;
    // the last group should be the parameters:
    var child = this.buildButton(matchInfo[matchInfo.length - 1]);
    link.parentNode.replaceChild(child, link);
  },

  createDoiLink: function (href, link) {
    var matchInfo = this.doiPattern.exec(href);
    if (matchInfo.length < this.doiGroup) {
      return;
    }
    var doiString = matchInfo[this.doiGroup];
    var smashUrl = 'rft_id=info:doi/' + doiString;
    var newLink = this.buildButton(smashUrl);
    link.parentNode.insertBefore(newLink, link.nextSibling);
    link.setAttribute('name', 'SMASHVisited');
  },

  createPubmedLink: function (href, link) {
    var smashUrl =
      href.replace(
        this.pubmedPattern,
        'rft_id=info:pmid/$3&rft.genre=article,chapter,bookitem&svc.fulltext=yes'
      );
    var newLink = this.buildButton(smashUrl);
    link.parentNode.insertBefore(newLink, link.nextSibling);
    link.setAttribute('name', 'SMASHVisited');
  },

  // Wikipedia for instance is using COInS spans
  createSpanBasedLinks: function (doc) {
    // Detect latent OpenURL SPANS and replace them with SMASH links
    var spans = doc.getElementsByTagName('span');
    for (var i = 0, n = spans.length*2; i < n; i++) {
      var span = spans[i];
      var query = span.getAttribute('title');

      // /Z3988 means OpenURL
      var clazzes = span.getAttribute('class') === null ? '' : span.getAttribute('class');
      var name = span.getAttribute('name') === null ? '' : span.getAttribute('name');

      if ((name !== 'SMASHVisited') && (clazzes.match(/Z3988/i) !== null)) {
        query += '&url_ver=' + SMASHLinkInserter.openUrlVersion;
        var child = this.buildButton(query);
        span.appendChild(child);
        span.setAttribute('name', 'SMASHVisited');
      }


    }
  },
  /**
   * Make the SMASH button.
   *
   * @param {Object} href
   */
  buildButton: function (href) {
    //debug('making link: ' + this.openURLPrefix + href + '&noredirect&sid=smash-browser-addon');
    var span = document.createElement('span');
    this.makeChild(href, document, span);
    return span;
  },

  createLink: function (resourceUrl) {
    browser.runtime.sendMessage({
      btnExist: true
    });
    // set the added link, this will avoid an extra call to the OpenURL API and fix the access url
    var a = document.createElement('a');
    a.href = resourceUrl
    a.target = '_blank';
    a.alt = 'SMASH';
    a.name = 'SMASHLink';
    a.className = 'smash-link';
    a.textContent = ' SMASH';

    return a;
  },

  makeChild: function (href, document, parent) {
    var resourceUrl;

    // insert the sid in the openurl for usage statistics reason
    if (!~href.indexOf('sid=')) {
      // sid is alone in the given openurl
      href += '&sid=lama-browser-addon';
    } else {
      // sid is not alone in the given openurl
      // then we have to handle special case if
      // the sid value is empty
      // (ex: ?foo=bar&sid= or ?sid=&foo=bar)
      if (/sid=(&|$)/.test(href)) {
        href = href.replace('sid=', 'sid=lama-browser-addon');
      } else {
        href = href.replace('sid=', 'sid=lama-browser-addon,');
      }
    }

    browser.storage.sync.get(function (result) {
    var requestUrl = SMASHLinkInserter.openURLPrefix + href;
    parent && parent.appendChild(SMASHLinkInserter.createLink(requestUrl));
    });

  },
};


function getUserPreferences(callback) {
    browser.storage.sync.get({
            showSmash: true,
        },
        function(items) {
            callback(items);
        });
}

getUserPreferences(function(userPreferences) {
  if (userPreferences.showSmash) {
    SMASHLinkInserter.onDOMContentLoaded();
  };
});

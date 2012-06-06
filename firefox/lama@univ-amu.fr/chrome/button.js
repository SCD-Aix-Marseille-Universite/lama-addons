function transformUrl() {
	var l=content.document.location;
	gBrowser.loadURI(l.href.replace(l,'lama.univ-amu.fr/login?url='+l));
	}
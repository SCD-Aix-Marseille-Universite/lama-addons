transformUrl = {

1: function () {
   var l=Browser.selectedTab.browser.currentURI.spec;
   Browser.loadURI(l.replace(l,'lama.univ-amu.fr/login?url='+l));
	},

}
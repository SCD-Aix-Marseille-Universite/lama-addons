transformUrl = {

1: function () {
   var l=gBrowser.currentURI.spec;
   gBrowser.loadURI(l.replace(l,'ezproxy.univ-abc.fr/login?url='+l));
	},

}
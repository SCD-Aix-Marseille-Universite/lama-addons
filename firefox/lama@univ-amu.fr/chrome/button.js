transformUrl = {

1: function () {
   var l=gBrowser.currentURI.spec;
   gBrowser.loadURI(l.replace(l,'lama.univ-amu.fr/login?url='+l));
	},

}
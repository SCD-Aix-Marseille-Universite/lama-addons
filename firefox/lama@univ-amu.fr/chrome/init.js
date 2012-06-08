window.addEventListener("load", em_myextensionLoad, true);

function em_myextensionLoad() {

if (document.getElementById("mybutton")) return;

try {
   var firefoxnav = document.getElementById("nav-bar");
   var curSet = firefoxnav.currentSet;
   if (curSet.indexOf("mybutton") == -1)
   {
     var set;
     if (curSet.indexOf("urlbar-container") != -1)
       set = firefoxnav.currentSet + ",mybutton";
     else 
       set = curSet.replace(/urlbar-container/, "mybutton,urlbar-container");
     firefoxnav.setAttribute("currentset", set);
     firefoxnav.currentSet = set;
     document.persist("nav-bar", "currentset");
     try {
       BrowserToolboxCustomizeDone(true);
     }
     catch (e) { }
   }
}
catch(e) { }
}

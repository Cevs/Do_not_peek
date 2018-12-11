var protection;
var mouseTrack;
var keyboardTrack;
var interval;
var timer;
var timerStatus;
var tabsRefreshed = false;

onStartUp();

//Fires on chrome startup
function onStartUp() {
  //Check if sync storage exists. If not create LocalDb storage
  chrome.storage.sync.get("DoNotPeek", function(data){
    if(typeof data.DoNotPeek === 'undefined'){
      createLocalDb();
    }
  });
  createSyncDb();
  refreshTabs();
}

/*
First initialization after load up
*/
function initialization(){
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.generalSettings.protection === true) {
      chrome.browserAction.setBadgeText({
        "text": "On"
      });
    }else{
      chrome.browserAction.setBadgeText({
        "text": "Off"
      });
    }
  });
}

/*
Create key object for extension in sync chrome storage, and fill it with default data
*/
function createSyncDb() {
  chrome.storage.sync.set({
    "DoNotPeek": {
      user: null,
      generalSettings: {
        protection: false,
        mouseTracking: false,
        keyboardTracking: false,
        timer: false,
        interval: 30
      },
      keyBindings: {
        protection: "",
        lock: "",
        mouseTracking: "",
        keyboardTracking: "",
        timer: ""
      },
      browserLocked: false
    }
  });
}

/*
Create key object for extension in local chrome storage, and fill it with default data
*/

function createLocalDb(){
  chrome.storage.local.set({
    "DoNotPeek": {
      sitesManagement: {
        sites: [],
        site_schemes:[],
        status: "whitelist"
      },
      customizationSettings: {
        backgroundColor: "#ffffff",
        formColor: "#f2f2f2",
        buttonColor: "#343a40",
        buttonFontColor: "#ffffff",
        formTitleFontColor: "#000000",
        formOpacity: 80,
        backgroundOpacity: 100,
        backgroundImage: {
          image: "",
          size: "cover"
        }
      }
    }
  });
}

//Event handler for updating user generalSettings
//Update settings made by user
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "RefreshSettings") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        timerStatus = data.DoNotPeek.generalSettings.timer;
        interval = data.DoNotPeek.generalSettings.interval;
        if (data.DoNotPeek.generalSettings.protection == true) {
          chrome.browserAction.setBadgeText({
            "text": "On"
          });
          createTimer();
        }else{
          chrome.browserAction.setBadgeText({
            "text": "Off"
          });
          deleteTimer();
        }
      });
    } else if (request.action === "UnlockTabs") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        data.DoNotPeek.browserLocked = false;
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
        });
        chrome.webRequest.onBeforeRequest.removeListener(manageRequests);
        refreshTabs();
        if (data.DoNotPeek.generalSettings.protection) {
          createTimer();
        }
      });
    } else if (request.action === "LockTabs") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        if (data.DoNotPeek.generalSettings.protection == true && data.DoNotPeek.browserLocked != true) {
          data.DoNotPeek.browserLocked = true;
          chrome.storage.sync.set({
            "DoNotPeek": data.DoNotPeek
          });

          chrome.webRequest.onBeforeRequest.removeListener(manageRequests);

          chrome.storage.local.get("DoNotPeek", function(data){
            sites = data.DoNotPeek.sitesManagement.sites;
            siteSchemes = data.DoNotPeek.sitesManagement.site_schemes;
            siteStatus = data.DoNotPeek.sitesManagement.status;
            siteSchemesLength = siteSchemes.length;
            chrome.webRequest.onBeforeRequest.addListener(
              manageRequests,
              {urls: ["<all_urls>"]},
              ["blocking"]);

            });
            refreshTabs();
          }
        });
      } else if (request.action === "ActivateProtection") {
        chrome.storage.sync.get("DoNotPeek", function(data) {
          if (data.DoNotPeek.generalSettings.protection == false) {
            data.DoNotPeek.generalSettings.protection = true;
            chrome.storage.sync.set({
              "DoNotPeek": data.DoNotPeek
            });
            chrome.browserAction.setBadgeText({
              "text": "On"
            });
            interval = data.DoNotPeek.generalSettings.interval;
            createTimer();
          } else {
            //Do nothing
          }
        });
      } else if (request.action === "ShowNotification"){
        chrome.notifications.create("Notification", request.notification);
      }else if(request.action === "Initialization"){
        initialization();
      }
    }
  );


  /*
  Function that check determine if request should be blocked or not.
  Block only those request that are using/contacting server for .js scripts
  Three states:
  - Blacklist: block all request for urls contained in sites array
  - Whitelist: allow all request for urls cointained in sites array
  - Extension request: allow all request that are crucial for extension app to work
  */
  function manageRequests(details){
    var orginalUrl = details.url.toLowerCase();
    var url = getRootOfUrl(orginalUrl);
    if(siteStatus == "whitelist"){

      if(orginalUrl.indexOf(".js") >= 0){
        if(orginalUrl.indexOf("background.js") >= 0 || orginalUrl.indexOf("bootstrap.min.js") >= 0
        || orginalUrl.indexOf("contentScript.js") >= 0 || orginalUrl.indexOf("jquery.min.js") >= 0
        || orginalUrl.indexOf("jscolor.js") >= 0 || orginalUrl.indexOf("popper.min.js") >= 0
        || orginalUrl.indexOf("popup.js") >= 0){
          //Crucial for extension work so we dont ban it
          return {cancel:false};
        }else{
          //Not crucial for extension work so we can ban it
          //But we need to check if .js scripts are from page that needs to be locked
          initiator = details.initiator;
          for(index = 0; index < sites.length; ++ index){
            s = sites[index];
            if (initiator.indexOf(s) != -1) {
              return {cancel:false};
            }
          }
          return {cancel:true};
        }
      }
    }else if(siteStatus == "blacklist"){
      if(sites.indexOf(url) > -1){
        //The value is in the array
        if(orginalUrl.indexOf(".js") >= 0){
          if(orginalUrl.indexOf("background.js") >= 0 || orginalUrl.indexOf("bootstrap.min.js") >= 0
          || orginalUrl.indexOf("contentScript.js") >= 0 || orginalUrl.indexOf("jquery.min.js") >= 0
          || orginalUrl.indexOf("jscolor.js") >= 0 || orginalUrl.indexOf("popper.min.js") >= 0
          || orginalUrl.indexOf("popup.js") >= 0){
            return {cancel:false};
          }
          return {cancel:true};
        }
      }
      return {cancel:false};
    }
  }

  // Delete previos timer and Create new timer if needed
  function createTimer() {
    deleteTimer();
    if (timerStatus == true) {
      timer = setInterval(function() {
        chrome.storage.sync.get("DoNotPeek", function(data) {
          if (!data.DoNotPeek.browserLocked) {
            data.DoNotPeek.browserLocked = true;
            chrome.storage.sync.set({
              'DoNotPeek': data.DoNotPeek
            });
            refreshTabs();
          }
        });
      }, interval * 1000);
    }
  }

  //Delete previous timer
  function deleteTimer() {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function refreshTabs() {
    chrome.tabs.query({}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.update(tabs[i].id, {
          url: tabs[i].url
        });
      }
    });
  }

  /*
  Return a root of url
  */
  function getRootOfUrl(url){
    var urlScheme = "";
    var start = url.indexOf("www.");
    var end = url.lastIndexOf(".com")+4;
    var slicedUrl = url.slice(start,end);
    return slicedUrl;
  }


  /*
  * Detect when user open extension tab in chrome
  * If protection is ON, close extension tab before load
  */
  chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    chrome.storage.sync.get("DoNotPeek", function(data){
      if(data.DoNotPeek.generalSettings.protection == true){
        chrome.tabs.remove(details.tabId);
      }
    });
  }, {url: [{urlMatches : 'chrome://*'}]});

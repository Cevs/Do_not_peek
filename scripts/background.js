var protection;
var mouseTrack;
var keyboardTrack;
var interval;
var timer;
var timerStatus;
var tabsRefreshed = false;

onStartUp();

function onStartUp() {
  refreshTabs();
  createDb();
  chrome.browserAction.setBadgeText({
    "text": "Off"
  });
}

/*
* Create database on first extension loadSettingsPanel
* Store default settings
*/
function createDb() {
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
        chrome.webRequest.onBeforeRequest.removeListener(
          blockScripts,
          {urls: ["<all_urls>"]},
          ["blocking"]);
          chrome.webRequest.onBeforeRequest.removeListener(
            allowScripts,
            {urls: ["<all_urls>"]},
            ["blocking"]);
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

            //Izvodi se samo jednom
            chrome.storage.local.get("DoNotPeek", function(data){
                siteSchemes = data.DoNotPeek.sitesManagement.site_schemes;
                var status = data.DoNotPeek.sitesManagement.status;
                siteSchemesLength = siteSchemes.length;
                if(status == "blacklist" && siteSchemesLength != 0){
                    chrome.webRequest.onBeforeRequest.addListener(
                    blockScripts,
                    {urls: siteSchemes},
                    ["blocking"]);
                }else if (status == "blacklist" && siteSchemesLength == 0){
                  chrome.webRequest.onBeforeRequest.addListener(
                  blockScripts,
                  {urls: ["<all_urls>"]},
                  ["blocking"]);
                }else if(status == "whitelist" && siteSchemesLength != 0){
                  chrome.webRequest.onBeforeRequest.addListener(
                  blockScripts,
                  {urls: ["<all_urls>"]},
                  ["blocking"]);

                  chrome.webRequest.onBeforeRequest.addListener(
                  allowScripts,
                  {urls: siteSchemes},
                  null);
                }else if(status == "whitelist" && siteSchemesLength == 0){
                  chrome.webRequest.onBeforeRequest.addListener(
                  blockScripts,
                  {urls: ["<all_urls>"]},
                  ["blocking"]);
                }

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
      }
    }
  );

  /*
  Function that block getting scripts from server using network
  Especially needed for youtube application to stop starting playback of video
  */
  function blockScripts(details){
    var url = details.url.toLowerCase();
    if(url.indexOf(".js") >= 0){
      if(url.indexOf("background.js") >= 0 || url.indexOf("bootstrap.min.js") >= 0
        || url.indexOf("contentScript.js") >= 0 || url.indexOf("jquery.min.js") >= 0
        || url.indexOf("jscolor.js") >= 0 || url.indexOf("popper.min.js") >= 0
        || url.indexOf("popup.js") >= 0){
          return {cancel:false};
        }
        return {cancel:true};
      }
      return {cancel: false};
    }


/*
  Function that allows getting scripts from server
*/
  function allowScripts(details){
    return {cancel:true};
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

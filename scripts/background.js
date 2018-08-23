var protection;
var mouseTrack;
var keyboardTrack;
var interval;
var timer;
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
      userSettings: {
        protection: false,
        mouseTracking: false,
        keyboardTracking: false,
        interval: 30
      },
      keyBindings: {
        protection: "",
        lock: "",
        mouseTracking:"",
        keyboardTracking:"",
        timer:""
      },
      browserLocked: false
    }
  });

  chrome.storage.local.set({
    "DoNotPeek": {
      sitesManagement: {
        sites: [],
        status: "lock"
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
  })
}

//Event handler for updating user userSettings
//Update settings made by user
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "UpdateUserSettings") {
      protection = request.data.protection;
      mouseTrack = request.data.mouseTracking;
      keyboardTrack = request.data.keyboardTracking;
      interval = request.data.timer;
      if (protection == true) {
        createTimer();
      } else {
        deleteTimer();
      }
    } else if (request.action === "UnlockTabs") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        data.DoNotPeek.browserLocked = false;
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
        });
        refreshTabs();
        if (data.DoNotPeek.userSettings.protection) {
          createTimer();
        }
      });
    } else if (request.action === "LockTabs") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        if (data.DoNotPeek.userSettings.protection == true) {
          data.DoNotPeek.browserLocked = true;
          chrome.storage.sync.set({
            "DoNotPeek": data.DoNotPeek
          });
          interval = data.DoNotPeek.userSettings.timer;
          refreshTabs();
        }
      });
    } else if (request.action === "RefreshTimer") {
      createTimer();
    } else if (request.action === "ActivateProtection") {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        if (data.DoNotPeek.userSettings.protection == false) {
          data.DoNotPeek.userSettings.protection = true;
          chrome.storage.sync.set({
            "DoNotPeek": data.DoNotPeek
          });
          interval = data.DoNotPeek.userSettings.timer;
          createTimer();
        } else {
          //Do nothing
        }
      });
    }
  }
);

/*
 * Handle the storage change event
 * When protection status in chrome storage changes, update badge accordingly
 */
chrome.storage.onChanged.addListener(function(changes, storageName) {
  if (changes.DoNotPeek.newValue.userSettings.protection == true) {
    chrome.browserAction.setBadgeText({
      "text": "On"
    });
  } else {
    chrome.browserAction.setBadgeText({
      "text": "Off"
    });
  }
});


//Create new timer
function createTimer() {
  deleteTimer();
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

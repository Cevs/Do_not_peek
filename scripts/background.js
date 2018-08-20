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
        mouseTrack: false,
        keyboardTrack: false,
        interval: 30
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
        formTitleFontColor:  "000000",
        formOpacity: 80,
        backgroundOpacity: 100,
        backgroundImage:{
          image:"",
          size:"cover"
        }
      }
    }
  })
}

//Dodaje svim tabovima listene onActivated
//Registrira promejenut aktivnog prozora i salje poruku contentScript.js
chrome.tabs.onActivated.addListener(function() {
  //Dohvaća sve tabove na kojima je trenutno fokus
  chrome.tabs.query({
    active: true,
    currentWindow: true,
    lastFocusedWindow: true
  }, function(tabs) {
    //salje id taba koji je aktivan (Treba dodati for petlju koja ce provrtit ako postoji vise prozora)
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
      // ...
    });
  });
});

//Event handler for updating user userSettings
//Update settings made by user
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "UpdateUserSettings") {
      protection = request.data.protection;
      mouseTrack = request.data.mouseTracking;
      keyboardTrack = request.data.keyboardTracking;
      interval = request.data.timer;
      if (protection) {
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
    } else if (request.action === "RefreshTimer") {
      createTimer();
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
        //sendMessageToContentScriptToLockTabs();
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
  chrome.tabs.getAllInWindow(null, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.update(tabs[i].id, {
        url: tabs[i].url
      });
    }
  });
}

/*function sendMessageToContentScriptToUnlockTabs(){
  chrome.tabs.getAllInWindow(null, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, {action: "UnlockTabs"}, function(response) {});
    }
  });
}

function sendMessageToContentScriptToLockTabs(){
  chrome.tabs.getAllInWindow(null, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, {action: "LockTabs"}, function(response) {});
    }
  });
}*/

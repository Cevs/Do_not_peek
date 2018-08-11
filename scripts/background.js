var protection;
var mouseTrack;
var keyboardTrack;
var interval;
var timer;
var tabsRefreshed = false;

onStartUp();

function onStartUp() {
  refreshTabs();
  chrome.storage.sync.get('userSettings', function(data) {
    protection = data.userSettings.protection;
    mouseTrack = data.userSettings.mouseTracking;
    keyboardTrack = data.userSettings.keyboardTracking;
    interval = data.userSettings.timer;
    chrome.storage.sync.set({
      'browserLocked': false
    });
    if (protection) {
      createTimer();
    } else {
      deleteTimer();
    }
  });
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
      chrome.storage.sync.set({
        'browserLocked': false
      });
      refreshTabs();
      chrome.storage.sync.get("userSettings", function(data) {
        if (data.userSettings.protection) {
          createTimer();
        }
      });
    }
  }
);



//Create new timer
function createTimer() {
  deleteTimer();
  timer = setInterval(function() {
    chrome.storage.sync.get("browserLocked", function(data) {
      if (!data.browserLocked) {
        chrome.storage.sync.set({
          'browserLocked': true
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

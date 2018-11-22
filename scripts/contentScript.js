keysPressed = [];
var keyBindingLock;
var keyBindingProtection;
var keyBindingMouseTracking;
var keyBindingKeyboardTracking;
var keyBindingTimer;
var tabLocked;

determineStatusOfPage();
//Function for determining if page needs to be locked. Determination is done by analyzing user settings stored in db

function determineStatusOfPage(){
  tabLocked = false;
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.browserLocked) {
      chrome.storage.local.get("DoNotPeek", function(data) {
        var sitesArr = [];
        url = window.location.href;
        if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
          sitesArr = data.DoNotPeek.sitesManagement.sites;
        }
        if ($.isEmptyObject(sitesArr)) {
          tabLocked = true;
          $('html').attr('style', 'display:none');
        } else if (data.DoNotPeek.sitesManagement.status === "blacklist") {
          $.each(sitesArr, function(index, value) {
            if (url.indexOf(value) != -1) {
              tabLocked = true;
              $('html').attr('style', 'display:none');
              return false; //break
            }
          });
        } else if (data.DoNotPeek.sitesManagement.status === "whitelist") {
          $.each(sitesArr, function(index, value) {
            if (url.indexOf(value) == -1) {
              tabLocked = true;
              $('html').attr('style', 'display:none');
              return false; //break
            }
          });
        }
      });
    }
  });
}


//$(document).ready(){} function
//Check if status of tab is set to locked. If true, lock tab
$(window).on("load", function(event){
  keysPressed = [];
  if (tabLocked == true) {
    window.stop();
    lockTab();
  } else {
    $('html').attr('style', 'display:');
  }
});

//Register even on keyup. Add key to array
$(document).on("keydown", function(event) {
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  chrome.storage.sync.get("DoNotPeek", function(data) {

    keyBindingLock = data.DoNotPeek.keyBindings.lock;
    keyBindingProtection = data.DoNotPeek.keyBindings.protection;
    keyBindingMouseTracking = data.DoNotPeek.keyBindings.mouseTracking;
    keyBindingKeyboardTracking = data.DoNotPeek.keyBindings.keyboardTracking;
    keyBindingTimer = data.DoNotPeek.keyBindings.timer;

    if ($.inArray(keyDown, keysPressed) == -1) {
      keysPressed.push(keyDown);
    }

    //Compare two arrays
    if ((JSON.stringify(keysPressed) == JSON.stringify(keyBindingLock)) && !($.isEmptyObject(keyBindingLock))) {
      sendMessageToBackgroundScriptToLockTabs();
      sendNotificationMessage("Manually locking tabs", "");
    } else if ((JSON.stringify(keysPressed) == JSON.stringify(keyBindingProtection)) && !($.isEmptyObject(keyBindingProtection))) {
      //Change status of protection
      sendMessageToBackgroundScriptToActivateProtection();
      sendNotificationMessage("Protection ON", "");
    } else if ((JSON.stringify(keysPressed) == JSON.stringify(keyBindingMouseTracking)) && !($.isEmptyObject(keyBindingMouseTracking))) {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        data.DoNotPeek.generalSettings.mouseTracking = !data.DoNotPeek.generalSettings.mouseTracking;
        if(data.DoNotPeek.generalSettings.mouseTracking){
          sendNotificationMessage("Mouse Tracking ON", "");
        }else{
          sendNotificationMessage("Mouse Tracking OFF", "");
        }
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
        });
      });
    } else if ((JSON.stringify(keysPressed) == JSON.stringify(keyBindingKeyboardTracking)) && !($.isEmptyObject(keyBindingKeyboardTracking))) {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        data.DoNotPeek.generalSettings.keyboardTracking = !data.DoNotPeek.generalSettings.keyboardTracking;
        if(data.DoNotPeek.generalSettings.keyboardTracking){
          sendNotificationMessage("Keyboard Tracking ON", "");
        }else{
          sendNotificationMessage("Keyboard Tracking OFF", "");
        }
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
        });
      });
    } else if ((JSON.stringify(keysPressed) == JSON.stringify(keyBindingTimer)) && !($.isEmptyObject(keyBindingTimer))) {
      chrome.storage.sync.get("DoNotPeek", function(data) {
        data.DoNotPeek.generalSettings.timer = !data.DoNotPeek.generalSettings.timer;
        if(data.DoNotPeek.generalSettings.timer ){
          sendNotificationMessage("Timer ON", "");
        }else{
          sendNotificationMessage("Timer OFF", "");
        }
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
        });
        sendMessageToBackgroundScriptToRefreshSettings();
      });
    }
  });
});

//Register even on keyup. Remove key from array
$(document).on("keyup", function(event) {
  removeKey = event.key;
  if (removeKey == "Control") {
    removeKey = "Ctrl";
  }
  keysPressed.splice($.inArray(removeKey, keysPressed), 1);
});

function sendMessageToBackgroundScriptToActivateProtection() {
  chrome.extension.sendMessage({
    action: "ActivateProtection"
  }, function(response) {});
}

// Send notificaition to background script to lock browser
function sendMessageToBackgroundScriptToLockTabs() {
  chrome.extension.sendMessage({
    action: "LockTabs"
  }, function(response) {});
}

//Send notification to background script to unlock browser
function sendMessageToBackgroundScriptToUnlockTabs() {
  chrome.extension.sendMessage({
    action: "UnlockTabs"
  }, function(response) {});
}


//Send notification to background script to refresh timer
function sendMessageToBackgroundScriptToRefreshSettings() {
  chrome.extension.sendMessage({
    action: "RefreshSettings"
  }, function(response) {});
}



function lockTab() {
  //Remove elements
  $('script').remove();
  $('body').remove();
  $("frameset").remove();
  $("frame").remove();
  $('meta').remove();
  $('html').attr('style', '');
  $("link:not([rel*='icon'])").remove();
  $('style').remove();
  chrome.storage.local.get("DoNotPeek", function(data) {
    //Update elements
    rgbForm = hexToRgb(data.DoNotPeek.customizationSettings.formColor);
    formColorValue = rgbForm + ", " + (data.DoNotPeek.customizationSettings.formOpacity / 100);
    //Change favicon of tab
    src = chrome.extension.getURL("../icons/lock.ico");
    $('link[rel*="icon"]').attr('href', src);
    //Add elements
    $("html").addClass("html-style");
    $('head title', window.parent.document).text('Unauthorized');
    //create form and set css options
    if (data.DoNotPeek.customizationSettings.backgroundImage.image != "") {
      $("html").append("<div class='form-container' style='background-image:url(\"" + data.DoNotPeek.customizationSettings.backgroundImage.image + "\"); background-size:" + data.DoNotPeek.customizationSettings.backgroundImage.size + "'>" +
      "<form class='form' style='background:rgb(" + formColorValue + ")'><h1 style='color:" + data.DoNotPeek.customizationSettings.formTitleFontColor + "'>Enter password</h1><div class='row'>" +
      "<input id='passwordValue' type='password' placeholder='password'/>" +
      "<input id='btnSubmitPassword' type='submit' value='Submit' style='width:100%; margin-top:20px; background-color: " + data.DoNotPeek.customizationSettings.buttonColor + "; color:" + data.DoNotPeek.customizationSettings.buttonFontColor + "'/></div>" +
      "<div id='errorText' style='margin-top:10px; color:#E50000; text-align:center; font-size:18px;'></div>" +
      "</form></div>"
    );
  } else {
    rgbBackground = hexToRgb(data.DoNotPeek.customizationSettings.backgroundColor);
    backgroundColorValue = rgbBackground + ", " + (data.DoNotPeek.customizationSettings.backgroundOpacity / 100);
    $("html").append("<div class='form-container' style='background:rgb(" + backgroundColorValue + ");'>" +
    "<form class='form' style='background:rgb(" + formColorValue + ")'><h1 style='color:" + data.DoNotPeek.customizationSettings.formTitleFontColor + "'>Enter password</h1><div class='row'>" +
    "<input id='passwordValue' type='password' placeholder='password'/>" +
    "<input id='btnSubmitPassword' type='submit' value='Submit' style='width:100%; margin-top:20px; background-color: " + data.DoNotPeek.customizationSettings.buttonColor + "; color:" + data.DoNotPeek.customizationSettings.buttonFontColor + ";'/></div>" +
    "<div id='errorText' style='margin-top:10px; color:#E50000; text-align:center; font-size:18px;'></div>" +
    "</form></div>"
  );
}

$("#btnSubmitPassword").click(function(e) {
  e.preventDefault();
  $("#errorText").empty();
  password = $("#passwordValue").val();
  chrome.storage.sync.get('DoNotPeek', function(data) {
    if (data.DoNotPeek.user.password == password) {
      sendMessageToBackgroundScriptToUnlockTabs();
    } else {
      //Stay locked
      $status = "<strong>Unauthorized</strong>";
      $("#errorText").append($status);
    }
  });
});
});
}

//Register mouse move
$("html").mousemove(function(event) {
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.generalSettings.mouseTracking && data.DoNotPeek.generalSettings.protection) {
      sendMessageToBackgroundScriptToRefreshSettings();
    }
  });
});

//Register keyboard pressed
$("html").keypress(function(event) {
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.generalSettings.keyboardTracking && data.DoNotPeek.generalSettings.protection) {
      sendMessageToBackgroundScriptToRefreshSettings();
    }
  });
});


/*
* Convert hex value to rgb
*/
function hexToRgb(hex) {
  if (hex.indexOf("#") != -1) {
    hex = hex.replace("#", '');
  }
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  return r + ", " + g + ", " + b;
}

function sendNotificationMessage(customTitle, customMessage){
  var notifOptions = {
    type:"basic",
    iconUrl:"../icons/hide_128.png",
    title:customTitle,
    message:customMessage,
    priority:2
  };
  chrome.extension.sendMessage({
    action: "ShowNotification",
    notification:notifOptions
  }, function(response) {});
}

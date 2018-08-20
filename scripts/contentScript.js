$(function() {
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.browserLocked) {
      chrome.storage.local.get("DoNotPeek", function(data) {
        var sitesArr = [];
        url = window.location.href;
        if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
          sitesArr = data.DoNotPeek.sitesManagement.sites;
        }
        if (data.DoNotPeek.sitesManagement.status === "lock") {
          if ($.isEmptyObject(sitesArr)) {
            lockTab();
          } else {
            $.each(sitesArr, function(index, value) {
              if (url.indexOf(value) != -1) {
                lockTab();
              }
            });
          }
        } else {
          if ($.isEmptyObject(sitesArr)) {
            lockTab();
          } else {
            $.each(sitesArr, function(index, value) {
              if (url.indexOf(value) == -1) {
                lockTab();
              }
            });
          }
        }
      });
    }
  });
});

//Send notification to background script to unlock browser
function sendMessageToBackgroundScriptToUnlockTabs() {
  chrome.extension.sendMessage({
    action: "UnlockTabs"
  }, function(response) {});
}


//Send notification to background script to refresh timer
function sendMessageToBackgroundScriptToRefreshTimer() {
  chrome.extension.sendMessage({
    action: "RefreshTimer"
  }, function(response) {});
}



function lockTab() {
  //Remove elements
  $('html').attr('style', '');
  $("link:not([rel*='icon'])").remove();
  $('script').remove();
  $('style').remove();
  $('body').remove();
  $('meta').remove();
  //Update elements
  //Change favicon of tab
  src = chrome.extension.getURL("../icons/lock.ico");
  $('link[rel*="icon"]').attr('href', src);
  //Add elements
  $("html").addClass("html-style");
  $('head title', window.parent.document).text('Restricted');
  $("html").append("<div class='form-container'><form class='form'><h1>Enter password</h1><div class='row'>" +
    "<input id='passwordValue' type='password' placeholder='password'/></br></div><div class='row'>" +
    "<input id='btnSubmitPassword' type='submit' value='Submit' style='width:100%; margin-top:20px;'></div> </form></div>");
  chrome.storage.local.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.customizationSettings.backgroundImage.image != "") {
      $(".form-container").css('background-image', 'url(' + data.DoNotPeek.customizationSettings.backgroundImage.image + ')');
      $(".form-container").css('background-size', data.DoNotPeek.customizationSettings.backgroundImage.size);
    } else {
      rgbBackground = hexToRgb(data.DoNotPeek.customizationSettings.backgroundColor);
      backgroundColorValue = rgbBackground + ", " + (data.DoNotPeek.customizationSettings.backgroundOpacity / 100);
      $(".form-container").css('background', "rgb(" + backgroundColorValue + ")");
    }
    rgbForm = hexToRgb(data.DoNotPeek.customizationSettings.formColor);
    formColorValue = rgbForm + ", " + (data.DoNotPeek.customizationSettings.formOpacity / 100);
    $(".form").css('background', "rgb(" + formColorValue + ")");
    $("#btnSubmitPassword").css('background-color', data.DoNotPeek.customizationSettings.buttonColor);
    $(".form h2").css("color", data.DoNotPeek.customizationSettings.formTitleFontColor);
    $("#btnSubmitPassword ").css("color", data.DoNotPeek.customizationSettings.buttonFontColor);

  });


  //Chnage url without creating new enter in histroy of browser
  //window.history.replaceState(null, "", "Restircted");

  $("#btnSubmitPassword").click(function(e) {
    e.preventDefault();
    password = $("#passwordValue").val();
    chrome.storage.sync.get('DoNotPeek', function(data) {
      if (data.DoNotPeek.user.password == password) {
        sendMessageToBackgroundScriptToUnlockTabs();
      } else {
        //Stay locked
      }
    });
  });
}


//Register mouse move
$("html").mousemove(function(event) {
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.userSettings.mouseTracking) {
      sendMessageToBackgroundScriptToRefreshTimer();
    }
  });
});

//Register keyboard pressed
$("html").keypress(function(event) {
  chrome.storage.sync.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.userSettings.keyboardTracking) {
      sendMessageToBackgroundScriptToRefreshTimer();
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

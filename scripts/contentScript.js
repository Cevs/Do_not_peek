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
  $("html").append("<div class='form-container'><form class='form'><h2>Enter password</h2><div class='row'>" +
    "<input id='passwordValue' type='password' placeholder='password'/></br></div><div class='row'>" +
    "<input id='btnSubmitPassword' type='submit' value='Submit' style='width:100%; margin-top:20px;'></div> </form></div>");
  chrome.storage.local.get("DoNotPeek", function(data) {
    if (data.DoNotPeek.background.image != "") {
      $(".form-container").css('background-image', 'url(' + data.DoNotPeek.background.image + ')');
      $(".form-container").css('background-size', data.DoNotPeek.background.size);
    }
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

//var detachedBody;
//var detachedHead;
$(function() {
  chrome.storage.sync.get("browserLocked", function(data) {
    if (data.browserLocked) {
      lockTab();
    }
  });
});

//Send notification to background script to unlock browser
function sendMessageToBackgroundScriptToUnlockTabs() {
  chrome.extension.sendMessage({
    action: "UnlockTabs"
  }, function(response) {});
}


function lockTab() {
  //Remove elements
  $("link:not([rel*='icon'])").remove();
  $('script').remove();
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

  //Chnage url without creating new enter in histroy of browser
  //window.history.replaceState(null, "", "Restircted");

  $("#btnSubmitPassword").click(function(e) {
    e.preventDefault();
    password = $("#passwordValue").val();
    chrome.storage.sync.get('user', function(data) {
      if (data.user.password == password) {
        sendMessageToBackgroundScriptToUnlockTabs();
      } else {
        //Stay locked
      }
    });
  });
}

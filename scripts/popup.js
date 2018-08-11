$(function() {
  chrome.storage.sync.get('user', function(data) {
    if (data.user == null) {
      $('.container').load('../html/popup_register.html');
    } else {
      $('.container').load('../html/popup_login.html');
    }
  });
});

//Registration (create and save default settings)
$(document).on('click', '#btnRegister', function(e) {
  var pass = $("#password").val();
  if (pass != null && pass != "") {
    var user = {
      password: pass
    };
    var userSettings = {
      timer: 30,
      protection: false,
      keyboardTracking: false,
      mouseTracking: false
    };
    chrome.storage.sync.set({
      'userSettings': userSettings,
      'user': user
    });
    $('.container').load('../html/popup_login.html');
  } else {
    $("#errText").text("Must not be empty!");
  }
});

//Login
$(document).on('click', '#btnLogin', function(e) {
  $("#statusText").empty();
  chrome.storage.sync.get('user', function(data) {
    var enteredPassword = $("#password").val();
    if (data.user.password == enteredPassword) {
      $('.container').load('../html/popup_settings_panel.html', function() {
        chrome.storage.sync.get('userSettings', function(data) {
          var protection = data.userSettings.protection;
          var mouseTrack = data.userSettings.mouseTracking;
          var keyboardTrack = data.userSettings.keyboardTracking;
          var seconds = data.userSettings.timer;
          $("#protectionStatus").prop('checked', protection);
          $("#trackingMouse").prop('checked', mouseTrack);
          $("#trackingKeyboard").prop('checked', keyboardTrack);
          $("#timer").val(seconds);
        });
      });
    } else {
      $status = "<div class='alert alert-danger text-center'><strong>Incorrect password</strong></div>";
      $("#statusText").append($status);
    }
  });
});



//Change password Save
$(document).on('click', "#btnSaveNewPassword", function(e) {
  $("#statusText").empty();
  var oldPassword = $("#oldPassword").val();
  var newPassword = $("#newPassword").val();
  chrome.storage.sync.get('user', function(data) {
    if (oldPassword == data.user.password) {
      if (newPassword != null && newPassword != "") {
        var user = {
          password: newPassword
        };
        chrome.storage.sync.set({
          'user': user
        });
        $status = "<div class='alert alert-success text-center'><strong>Password changed</strong></div>";
        $("#statusText").append($status);
        $("#oldPassword").val("")
        $("#newPassword").val("");
      } else {
        $status = "<div class='alert alert-warning text-center'><strong>New password must not be empty</strong></div>";
        $("#statusText").append($status);
      }
    } else {
      $status = "<div class='alert alert-danger text-center'><strong>Incorrect old password</strong></div>";
      $("#statusText").append($status);
    }
  });
});

//Update settings
$(document).on('change', "#protectionStatus, #trackingMouse, #trackingKeyboard, #timer", function(e) {
  var protection = $('#protectionStatus').is(":checked");
  var mouseTrack = $('#trackingMouse').is(":checked");
  var keyboardTrack = $('#trackingKeyboard').is(":checked");
  var seconds = $("#timer").val();

  var userSettings = {
    protection: protection,
    keyboardTracking: keyboardTrack,
    mouseTracking: mouseTrack,
    timer: seconds
  };
  chrome.storage.sync.set({
    'userSettings': userSettings
  });
  //Send updated settings to background script
  chrome.runtime.sendMessage({
    action: "UpdateUserSettings",
    data: {
      protection: protection,
      keyboardTracking: keyboardTrack,
      mouseTracking: mouseTrack,
      timer: seconds
    }
  });
});

//Navigate to change password view
$(document).on('click', '#btnChangePasswordView', function(e) {
  $('.container').load("../html/popup_change_password.html");
});

//Navigate to control panel view
$(document).on('click', '#changePasswordBackLink', function(e) {
  e.preventDefault();
  $('.container').load('../html/popup_settings_panel.html', function() {
    chrome.storage.sync.get('userSettings', function(data) {
      var protection = data.userSettings.protection;
      var mouseTrack = data.userSettings.mouseTracking;
      var keyboardTrack = data.userSettings.keyboardTracking;
      var seconds = data.userSettings.timer;
      $("#protectionStatus").prop('checked', protection);
      $("#trackingMouse").prop('checked', mouseTrack);
      $("#trackingKeyboard").prop('checked', keyboardTrack);
      $("#timer").val(seconds);
    });
  });
});

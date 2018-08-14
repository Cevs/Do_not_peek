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
//Navigate to set bacground view
$(document).on('click', "#btnSetBackground", function(e) {
  $('.container').load("../html/popup_set_background.html", function() {
    chrome.storage.local.get('background', function(data) {
      if (data.background.image != "" && typeof data.background.image !== 'undefined') {
        if(data.background.size == "cover"){
          $("#radioFullSize").prop("checked",true);
        }else if(data.background.size == "auto"){
          $("#radioAutoSize").prop("checked",true);
        }
        $('.image-upload-wrap').hide();
        $('.file-upload-image').attr('src', data.background.image);
        $('.file-upload-content').show();
      } else {
        removeUpload();
      }
    });
  });
});

//Navigate to change password view
$(document).on('click', '#btnChangePasswordView', function(e) {
  $('.container').load("../html/popup_change_password.html");
});

//Navigate to  user settings view from change password view
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

//Navigate to user settings view from set background btnChangePasswordView
$(document).on('click', '#setBackgroundBackLink', function(e) {
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

$(document).on('change', '#uploadImage', function() {
  var input = ($("#uploadImage"))[0];
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('.image-upload-wrap').hide();

      $('.file-upload-image').attr('src', e.target.result);
      $('.file-upload-content').show();

      $('.image-title').html(input.files[0].name);
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
});

$(document).on('click', "#btnRemoveUploadedImage", function() {
  removeUpload();
});

$(document).on('click', "#btnSaveImage", function() {
  var input = ($("#uploadImage"))[0];
  var imageSize = $("input[name=optradio]:checked").val()

  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var backgroundObject = {
        image: e.target.result,
        size: imageSize
      };
      chrome.storage.local.set({
        "background": backgroundObject
      });
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    chrome.storage.local.get("background", function(data) {
      if (data.background.image != "") {
        var backgroundObject = {
          image: data.background.image,
          size: imageSize
        };
        chrome.storage.local.set({
          "background": backgroundObject
        });
      } else {
        removeUpload();
      }
    });
  }
});

function removeUpload() {
  $('.file-upload-input').replaceWith($('.file-upload-input').clone());
  $('.file-upload-content').hide();
  $('.image-upload-wrap').show();
  $('.image-upload-wrap').bind('dragover', function() {
    $('.image-upload-wrap').addClass('image-dropping');
  });
  $('.image-upload-wrap').bind('dragleave', function() {
    $('.image-upload-wrap').removeClass('image-dropping');
  });
  var backgroundObject = {
    image: "",
    size: "cover"
  };
  chrome.storage.local.set({
    "background": backgroundObject
  });
}

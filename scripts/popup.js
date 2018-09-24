var lockKeyBinding;
var protectionKeyBinding;
var mouseTrackingKeyBinding;
var keyboardTrackingKeyBinding;
var timerKeyBinding;

$(function() {
  chrome.storage.sync.get('DoNotPeek', function(data) {
    if (data.DoNotPeek.user == null) {
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
    var userObj = {
      password: pass
    };
    chrome.storage.sync.get("DoNotPeek", function(data) {
      data.DoNotPeek.user = userObj;
      chrome.storage.sync.set({
        "DoNotPeek": data.DoNotPeek
      });
    });
    $('.container').load('../html/popup_login.html');
  } else {
    $("#errText").text("Must not be empty!");
  }
});

//Login
$(document).on('click', '#btnLogin', function(e) {
  $("#statusText").empty();
  chrome.storage.sync.get('DoNotPeek', function(data) {
    var enteredPassword = $("#password").val();
    if (data.DoNotPeek.user.password == enteredPassword) {
      $('.container').load('../html/popup_general_settings.html', function() {
        $('[data-toggle="tooltip"]').tooltip();
        chrome.storage.sync.get('DoNotPeek', function(data) {
          var protection = data.DoNotPeek.generalSettings.protection;
          var mouseTrack = data.DoNotPeek.generalSettings.mouseTracking;
          var keyboardTrack = data.DoNotPeek.generalSettings.keyboardTracking;
          var timer = data.DoNotPeek.generalSettings.timer;
          var seconds = data.DoNotPeek.generalSettings.interval;
          $("#protectionStatus").prop('checked', protection);
          $("#trackingMouse").prop('checked', mouseTrack);
          $("#trackingKeyboard").prop('checked', keyboardTrack);
          $("#timer").prop('checked', timer);
          $("#interval").val(seconds);
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
  chrome.storage.sync.get('DoNotPeek', function(data) {
    if (oldPassword == data.DoNotPeek.user.password) {
      if (newPassword != null && newPassword != "") {
        var user = {
          password: newPassword
        };
        data.DoNotPeek.user = user;
        chrome.storage.sync.set({
          "DoNotPeek": data.DoNotPeek
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
$(document).on('change', "#protectionStatus, #trackingMouse, #trackingKeyboard, #timer, #interval", function(e) {
  var protection = $('#protectionStatus').is(":checked");
  var mouseTrack = $('#trackingMouse').is(":checked");
  var keyboardTrack = $('#trackingKeyboard').is(":checked");
  var timerStatus = $("#timer").is(":checked");
  var seconds = $("#interval").val();

  var generalSettingsObj = {
    protection: protection,
    keyboardTracking: keyboardTrack,
    mouseTracking: mouseTrack,
    timer: timerStatus,
    interval: seconds
  };

  chrome.storage.sync.get("DoNotPeek", function(data) {
    data.DoNotPeek.generalSettings = generalSettingsObj;
    chrome.storage.sync.set({
      "DoNotPeek": data.DoNotPeek
    });
    chrome.runtime.sendMessage({
      action: "RefreshSettings"
    }, function(response) {});
  });
});

//Navigate to customization settings
$(document).on('click', "#btnSetBackground", function(e) {
  $('.container').load("../html/popup_customization_settings.html", function() {
    //instantiate jscolor (Needed because of dynamic loading html elements)
    jscolor.installByClassName("jscolor");
    $('[data-toggle="tooltip"]').tooltip();
    chrome.storage.local.get('DoNotPeek', function(data) {
      if (data.DoNotPeek.customizationSettings.backgroundImage.image != "" && typeof data.DoNotPeek.customizationSettings.backgroundImage.image !== 'undefined') {
        $('.image-upload-wrap').hide();
        $('.file-upload-image').attr('src', data.DoNotPeek.customizationSettings.backgroundImage.image);
        $('.file-upload-content').show();
      }
      if (data.DoNotPeek.customizationSettings.backgroundImage.size == "cover") {
        $("#radioFullSize").prop("checked", true);
      } else if (data.DoNotPeek.customizationSettings.backgroundImage.size == "auto") {
        $("#radioAutoSize").prop("checked", true);
      } else {
        $("#radioFullSize").prop("checked", true);
      }

      //Customization generalSettings
      if (data.DoNotPeek.customizationSettings != "" && typeof data.DoNotPeek.customizationSettings !== "undefined") {
        $("#btnColorPicker").val(data.DoNotPeek.customizationSettings.buttonColor);
        $("#btnColorPicker").css("background-color", data.DoNotPeek.customizationSettings.buttonColor);
        $("#btnFontColorPicker").val(data.DoNotPeek.customizationSettings.buttonFontColor);
        $("#btnFontColorPicker").css("background-color", data.DoNotPeek.customizationSettings.buttonFontColor);
        $("#formColorPicker").val(data.DoNotPeek.customizationSettings.formColor);
        $("#formColorPicker").css("background-color", data.DoNotPeek.customizationSettings.formColor);
        $("#formTitleColorPicker").val(data.DoNotPeek.customizationSettings.formTitleFontColor);
        $("#formTitleColorPicker").css("background-color", data.DoNotPeek.customizationSettings.formTitleFontColor);
        $("#formOpacityRange").val(data.DoNotPeek.customizationSettings.formOpacity);
        $("#formOpacityRangeShow").text(data.DoNotPeek.customizationSettings.formOpacity);
        $("#backgroundColorPicker").val(data.DoNotPeek.customizationSettings.backgroundColor);
        $("#backgroundColorPicker").css("background-color", data.DoNotPeek.customizationSettings.backgroundColor);
        $("#backgroundOpacityRange").val(data.DoNotPeek.customizationSettings.backgroundOpacity);
        $("#backgroundOpacityRangeShow").text(data.DoNotPeek.customizationSettings.backgroundOpacity);
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
  loadGeneralOptions(e);
});

//Navigate to user settings view from set background btnChangePasswordView
$(document).on('click', '#setBackgroundBackLink', function(e) {
  loadGeneralOptions(e);
});

//Navigate to sites management
$(document).on('click', '#btnSetSiteSettings', function(e) {
  $('.container').load("../html/popup_sites_management.html", function() {
    chrome.storage.local.get("DoNotPeek", function(data) {
      if (data.DoNotPeek.sitesManagement == "" || typeof data.DoNotPeek.sitesManagement === 'undefined') {
        var sitesManagementObj = {
          sites: [],
          status: "lock"
        };
        data.DoNotPeek.sitesManagement = sitesManagementObj;
        chrome.storage.local.set({
          "DoNotPeek": data.DoNotPeek
        });
        $("#radio-lock").prop("checked", true);
      } else {
        var sitesArr = [];
        if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
          sitesArr = data.DoNotPeek.sitesManagement.sites;
        }
        $.each(sitesArr, function(index, v) {
          $("#listOfSites").append("<option value='" + v + "'>" + v + "</option>");
        });
        if (data.DoNotPeek.sitesManagement.status === "lock") {
          $("#radio-lock").prop("checked", true);
        } else {
          $("#radio-unlock").prop("checked", true);
        }
      }
    });
  });
});

$(document).on('click', "#siteSettingsBackLink", function(e) {
  loadGeneralOptions(e);
});

//Navigate  to key bindings view
$(document).on("click", "#btnKeyBindings", function(e) {
  lockKeyBinding = [];
  protectionKeyBinding = [];
  mouseTrackingKeyBinding = [];
  keyboardTrackingKeyBinding = [];
  timerKeyBinding = [];
  $('.container').load("../html/popup_key_bindings.html", function() {
    $('[data-toggle="tooltip"]').tooltip();
    chrome.storage.sync.get("DoNotPeek", function(data) {
      protectionKeyBindingsText = "";
      lockKeyBindingsText = "";
      mouseTrackingKeyBindingText = "";
      keyboardTrackingKeyBindingText = "";
      timerKeyBindingText = "";
      $.each(data.DoNotPeek.keyBindings.protection, function(index, item) {
        protectionKeyBinding.push(item);
        if (index == 0) {
          protectionKeyBindingsText += item;
        } else {
          protectionKeyBindingsText += " + " + item;
        }
      });
      $.each(data.DoNotPeek.keyBindings.lock, function(index, item) {
        lockKeyBinding.push(item);
        if (index == 0) {
          lockKeyBindingsText += item;
        } else {
          lockKeyBindingsText += " + " + item;
        }
      });
      $.each(data.DoNotPeek.keyBindings.mouseTracking, function(index, item) {
        mouseTrackingKeyBinding.push(item);
        if (index == 0) {
          mouseTrackingKeyBindingText += item;
        } else {
          mouseTrackingKeyBindingText += " + " + item;
        }
      });
      $.each(data.DoNotPeek.keyBindings.keyboardTracking, function(index, item) {
        keyboardTrackingKeyBinding.push(item);
        if (index == 0) {
          keyboardTrackingKeyBindingText += item;
        } else {
          keyboardTrackingKeyBindingText += " + " + item;
        }
      });
      $.each(data.DoNotPeek.keyBindings.timer, function(index, item) {
        timerKeyBinding.push(item);
        if (index == 0) {
          timerKeyBindingText += item;
        } else {
          timerKeyBindingText += " + " + item;
        }
      });
      $("#protectionKeyBindings").val(protectionKeyBindingsText);
      $("#lockKeyBindings").val(lockKeyBindingsText);
      $("#mouseTrackingBinding").val(mouseTrackingKeyBindingText);
      $("#keyboardTrackingBinding").val(keyboardTrackingKeyBindingText);
      $("#timerBinding").val(timerKeyBindingText);
    });
  });
});

//Navigate back to general options
$(document).on("click", "#keyBindingsBackLink", function(e) {
  loadGeneralOptions(e);
});

//Register keydown event and update key bindings
$(document).on("keydown", "#protectionKeyBindings", function(event) {
  event.preventDefault();
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  if ($.inArray(keyDown, protectionKeyBinding) == -1) {
    protectionKeyBinding.push(keyDown);
  }
  $.each(protectionKeyBinding, function(index, item) {
    if (index == 0) {
      $("#protectionKeyBindings").val(item);
    } else {
      $("#protectionKeyBindings").val($("#protectionKeyBindings").val() + " + " + item);
    }
  });
});

//Register keydown event and update key bindings
$(document).on("keydown", "#lockKeyBindings", function(event) {
  event.preventDefault();
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  if ($.inArray(keyDown, lockKeyBinding) == -1) {
    lockKeyBinding.push(keyDown);
  }
  $.each(lockKeyBinding, function(index, item) {
    if (index == 0) {
      $("#lockKeyBindings").val(item);
    } else {
      $("#lockKeyBindings").val($("#lockKeyBindings").val() + " + " + item);
    }
  });
});

//Register keydown event and update key bindings
$(document).on("keydown", "#mouseTrackingBinding", function(event) {
  event.preventDefault();
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  if ($.inArray(keyDown, mouseTrackingKeyBinding) == -1) {
    mouseTrackingKeyBinding.push(keyDown);
  }
  $.each(mouseTrackingKeyBinding, function(index, item) {
    if (index == 0) {
      $("#mouseTrackingBinding").val(item);
    } else {
      $("#mouseTrackingBinding").val($("#mouseTrackingBinding").val() + " + " + item);
    }
  });
});

//Register keydown event and update key bindings
$(document).on("keydown", "#keyboardTrackingBinding", function(event) {
  event.preventDefault();
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  if ($.inArray(keyDown, keyboardTrackingKeyBinding) == -1) {
    keyboardTrackingKeyBinding.push(keyDown);
  }
  $.each(keyboardTrackingKeyBinding, function(index, item) {
    if (index == 0) {
      $("#keyboardTrackingBinding").val(item);
    } else {
      $("#keyboardTrackingBinding").val($("#keyboardTrackingBinding").val() + " + " + item);
    }
  });
});

//Register keydown event and update key bindings
$(document).on("keydown", "#timerBinding", function(event) {
  event.preventDefault();
  keyDown = event.key;
  if (keyDown == "Control") {
    keyDown = "Ctrl";
  }
  if ($.inArray(keyDown, timerKeyBinding) == -1) {
    timerKeyBinding.push(keyDown);
  }
  $.each(timerKeyBinding, function(index, item) {
    if (index == 0) {
      $("#timerBinding").val(item);
    } else {
      $("#timerBinding").val($("#timerBinding").val() + " + " + item);
    }
  });
});

//Erase  protection key bindings
$(document).on("click", "#eraseProtectionKeyBindings", function(e) {
  protectionKeyBinding = [];
  $("#protectionKeyBindings").val("");
});

//Erase  lock key bindings
$(document).on("click", "#eraseLockKeyBindings", function(e) {
  lockKeyBinding = [];
  $("#lockKeyBindings").val("");
});

//Erase  mouse tracking key bindings
$(document).on("click", "#eraseMouseTrackingBinding", function(e) {
  mouseTrackingKeyBinding = [];
  $("#mouseTrackingBinding").val("");
});

//Erase  keyboard tracking key bindings
$(document).on("click", "#eraseKeyboardTrackingBinding", function(e) {
  keyboardTrackingKeyBinding = [];
  $("#keyboardTrackingBinding").val("");
});

//Erase timer tracking key bindings
$(document).on("click", "#eraseTimerBinding", function(e) {
  timerKeyBinding = [];
  $("#timerBinding").val("");
});

// Save key bindings changes
$(document).on("click", "#btnSaveKeyBindings", function() {
  $("#statusText").empty();
  chrome.storage.sync.get("DoNotPeek", function(data) {
    data.DoNotPeek.keyBindings.protection = protectionKeyBinding;
    data.DoNotPeek.keyBindings.lock = lockKeyBinding;
    data.DoNotPeek.keyBindings.mouseTracking = mouseTrackingKeyBinding;
    data.DoNotPeek.keyBindings.keyboardTracking = keyboardTrackingKeyBinding;
    data.DoNotPeek.keyBindings.timer = timerKeyBinding;
    chrome.storage.sync.set({
      "DoNotPeek": data.DoNotPeek
    });
    $status = "<div class='alert alert-success text-center'><strong>Bindings saved</strong></div>";
    $("#statusText").append($status);
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
      chrome.storage.local.get("DoNotPeek", function(data) {
        var backgroundImageObject = {
          image: e.target.result,
          size: data.DoNotPeek.customizationSettings.backgroundImage.size
        };
        data.DoNotPeek.customizationSettings.backgroundImage = backgroundImageObject;
        chrome.storage.local.set({
          "DoNotPeek": data.DoNotPeek
        });
      });
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
});

$(document).on('change', "input[name='backgroundImageRadio']", function() {
  var imageSize = $("input[name=backgroundImageRadio]:checked").val()
  chrome.storage.local.get("DoNotPeek", function(data) {
    var backgroundObject = {
      image: data.DoNotPeek.customizationSettings.backgroundImage.image,
      size: imageSize
    };
    data.DoNotPeek.customizationSettings.backgroundImage = backgroundObject;
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('click', "#btnRemoveUploadedImage", function() {
  removeUpload();
});


//Add new site to list of sites that will not be locked
$(document).on('click', "#btnAddSite", function(e) {
  $("#statusText").empty();
  newSiteUrl = $("#siteUrl").val();
  if (newSiteUrl != "") {
    chrome.storage.local.get("DoNotPeek", function(data) {
      var sitesArr = [];
      if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
        sitesArr = data.DoNotPeek.sitesManagement.sites;
      }
      if (($.inArray(newSiteUrl, sitesArr)) == -1) {
        sitesArr.push(newSiteUrl);
        var sitesManagementObj = {
          sites: sitesArr,
          status: data.DoNotPeek.sitesManagement.status
        };
        data.DoNotPeek.sitesManagement = sitesManagementObj;
        chrome.storage.local.set({
          "DoNotPeek": data.DoNotPeek
        });
        $("#listOfSites").empty();
        $.each(sitesArr, function(index, v) {
          $("#listOfSites").append("<option value='" + v + "'>" + v + "</option>");
        });
        $("#siteUrl").val("");
      } else {
        $status = "<div class='alert alert-warning text-center'><strong>URL of site already added</strong></div>";
        $("#statusText").append($status);
      }
    });
  }
});

//Remove site from list of sites
$(document).on('click', "#btnRemoveSite", function(e) {
  $("#statusText").empty();
  siteUrl = $("#listOfSites option:selected").val();
  chrome.storage.local.get("DoNotPeek", function(data) {
    var sitesArr = [];
    if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
      sitesArr = data.DoNotPeek.sitesManagement.sites;
    }
    sitesArr.splice($.inArray(siteUrl, sitesArr), 1);
    var sitesManagementObj = {
      sites: sitesArr,
      status: data.DoNotPeek.sitesManagement.status
    };
    data.DoNotPeek.sitesManagement = sitesManagementObj;
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
    $("#listOfSites").empty();
    $.each(sitesArr, function(index, v) {
      $("#listOfSites").append("<option value='" + v + "'>" + v + "</option>");
    });
  });
});

/*
 * A listener who handles the event of changing the selected option (radio button)
 * After select has changed, save change in local store
 */
$(document).on('change', "input[name=sitesManagementRadio]", function(e) {
  var radioVal = $("input[name=sitesManagementRadio]:checked").val()
  chrome.storage.local.get("DoNotPeek", function(data) {
    sitesArr = [];
    if (data.DoNotPeek.sitesManagement.sites != "" && typeof data.DoNotPeek.sitesManagement.sites !== 'undefined') {
      sitesArr = data.DoNotPeek.sitesManagement.sites;
    }
    sitesManagementObj = {
      sites: sitesArr,
      status: radioVal
    };
    data.DoNotPeek.sitesManagement = sitesManagementObj;
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', "#formOpacityRange", function(e) {
  var formOpacityValue = $("#formOpacityRange").val();
  $("#formOpacityRangeShow").text(formOpacityValue);
});

$(document).on('change', "#backgroundOpacityRange", function(e) {
  var formOpacityValue = $("#backgroundOpacityRange").val();
  $("#backgroundOpacityRangeShow").text(formOpacityValue);
});

$(document).on('change', '#btnColorPicker', function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.buttonColor = "#" + $("#btnColorPicker").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', '#btnFontColorPicker', function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.buttonFontColor = "#" + $("#btnFontColorPicker").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', "#formTitleColorPicker", function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.formTitleFontColor = "#" + $("#formTitleColorPicker").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', "#formColorPicker", function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.formColor = "#" + $("#formColorPicker").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', "#formOpacityRange", function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.formOpacity = $("#formOpacityRange").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

$(document).on('change', "#backgroundColorPicker", function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.backgroundColor = "#" + $("#backgroundColorPicker").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
});

/*
  Performe quick lock of browser
*/
$(document).on('click', "#btnQuickLock", function(){
  chrome.storage.sync.get("DoNotPeek", function(data){
    data.DoNotPeek.generalSettings.protection  = true;
    chrome.storage.sync.set({
      "DoNotPeek":data.DoNotPeek
    });
    sendMessageToBackgroundScriptToLockTabs();
  });
  chrome.browserAction.setBadgeText({
    "text": "On"
  });
});

$(document).on('change', "#backgroundOpacityRange", function() {
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.backgroundOpacity = $("#backgroundOpacityRange").val();
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
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
  var imageSize = $("input[name=backgroundImageRadio]:checked").val()
  var backgroundObject = {
    image: "",
    size: imageSize
  };
  chrome.storage.local.get("DoNotPeek", function(data) {
    data.DoNotPeek.customizationSettings.backgroundImage = backgroundObject;
    chrome.storage.local.set({
      "DoNotPeek": data.DoNotPeek
    });
  });
  $("#statusText").empty();
}

//Load settings pannel
function loadGeneralOptions(event) {
  event.preventDefault();
  $('.container').load('../html/popup_general_settings.html', function() {
    chrome.storage.sync.get('DoNotPeek', function(data) {
      var protection = data.DoNotPeek.generalSettings.protection;
      var mouseTrack = data.DoNotPeek.generalSettings.mouseTracking;
      var keyboardTrack = data.DoNotPeek.generalSettings.keyboardTracking;
      var timerStatus = data.DoNotPeek.generalSettings.timer;
      var seconds = data.DoNotPeek.generalSettings.interval;
      $("#protectionStatus").prop('checked', protection);
      $("#trackingMouse").prop('checked', mouseTrack);
      $("#trackingKeyboard").prop('checked', keyboardTrack);
      $("#timer").prop('checked', timerStatus);
      $("#interval").val(seconds);
    });
  });
}

// Send notificaition to background script to lock browser
function sendMessageToBackgroundScriptToLockTabs() {
  chrome.runtime.sendMessage({
    action: "LockTabs"
  }, function(response) {});
}

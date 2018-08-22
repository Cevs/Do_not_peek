$(function() {
  $('[data-toggle="tooltip"]').tooltip();
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
    var userSettingsObj = {
      timer: 30,
      protection: false,
      keyboardTracking: false,
      mouseTracking: false
    };

    chrome.storage.sync.get("DoNotPeek", function(data) {
      data.DoNotPeek.userSettings = userSettingsObj;
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
      $('.container').load('../html/popup_general_options.html', function() {
        chrome.storage.sync.get('DoNotPeek', function(data) {
          var protection = data.DoNotPeek.userSettings.protection;
          var mouseTrack = data.DoNotPeek.userSettings.mouseTracking;
          var keyboardTrack = data.DoNotPeek.userSettings.keyboardTracking;
          var seconds = data.DoNotPeek.userSettings.timer;
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
$(document).on('change', "#protectionStatus, #trackingMouse, #trackingKeyboard, #timer", function(e) {
  var protection = $('#protectionStatus').is(":checked");
  var mouseTrack = $('#trackingMouse').is(":checked");
  var keyboardTrack = $('#trackingKeyboard').is(":checked");
  var seconds = $("#timer").val();

  var userSettingsObj = {
    protection: protection,
    keyboardTracking: keyboardTrack,
    mouseTracking: mouseTrack,
    timer: seconds
  };

  chrome.storage.sync.get("DoNotPeek", function(data) {
    data.DoNotPeek.userSettings = userSettingsObj;
    chrome.storage.sync.set({
      "DoNotPeek": data.DoNotPeek
    });
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

//Navigate to customization settings
$(document).on('click', "#btnSetBackground", function(e) {
  $('.container').load("../html/popup_customization_settings.html", function() {
    //instantiate jscolor (Needed because of dynamic loading html elements)
    jscolor.installByClassName("jscolor");
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

      //Customization userSettings
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
  loadSettingsPanel(e);
});

//Navigate to user settings view from set background btnChangePasswordView
$(document).on('click', '#setBackgroundBackLink', function(e) {
  loadSettingsPanel(e);
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
  loadSettingsPanel(e);
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

/*$(document).on('click', "#btnSaveImage", function() {
  $("#statusText").empty();
  var input = ($("#uploadImage"))[0];
  var imageSize = $("input[name=backgroundImageRadio]:checked").val()

  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var backgroundImageObject = {
        image: e.target.result,
        size: imageSize
      };
      chrome.storage.local.get("DoNotPeek", function(data) {
        data.DoNotPeek.customizationSettings.backgroundImage = backgroundImageObject;
        chrome.storage.local.set({
          "DoNotPeek": data.DoNotPeek
        });
      });
      $status = "<div class='alert alert-success text-center'><strong>Background saved</strong></div>";
      $("#statusText").append($status);
    };
    reader.readAsDataURL(input.files[0]);
  } else {

    chrome.storage.local.get("DoNotPeek", function(data) {
      if (data.DoNotPeek.customizationSettings.backgroundImage.image != "") {
        var backgroundImageObject = {
          image: data.DoNotPeek.customizationSettings.backgroundImage.image,
          size: imageSize
        };
        data.DoNotPeek.customizationSettings.backgroundImage = backgroundImageObject;
        chrome.storage.local.set({
          "DoNotPeek": data.DoNotPeek
        });
        $status = "<div class='alert alert-success text-center'><strong>Background saved</strong></div>";
        $("#statusText").append($status);
      } else {
        removeUpload();
      }
    });
  }
});*/

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
function loadSettingsPanel(event) {
  event.preventDefault();
  $('.container').load('../html/popup_general_options.html', function() {
    chrome.storage.sync.get('DoNotPeek', function(data) {
      var protection = data.DoNotPeek.userSettings.protection;
      var mouseTrack = data.DoNotPeek.userSettings.mouseTracking;
      var keyboardTrack = data.DoNotPeek.userSettings.keyboardTracking;
      var seconds = data.DoNotPeek.userSettings.timer;
      $("#protectionStatus").prop('checked', protection);
      $("#trackingMouse").prop('checked', mouseTrack);
      $("#trackingKeyboard").prop('checked', keyboardTrack);
      $("#timer").val(seconds);
    });
  });
}


$(function() {
  chrome.storage.sync.get('user', function(data) {
    if (data.user == null) {
      $('.container').load('../html/popup_register.html');
    } else {
      $('.container').load('../html/popup_login.html');
    }
  });
});

//Registration
$(document).on('click', '#btnRegister', function(e) {
  var pass = $("#password").val();
  if (pass != null && pass != "") {
    var user = {
      password: pass
    };
    chrome.storage.sync.set({
      'user': user
    });
    $('.container').load('../html/popup_login.html');
  }else{
      $("#errText").text("Must not be empty!");
  }
});

//Login
$(document).on('click', '#btnLogin', function(e) {
  chrome.storage.sync.get('user',function(data){
    var enteredPassword = $("#password").val();
    if(data.user.password == enteredPassword){
      $('.container').load('../html/popup_control_panel.html');
    }else{
      $("#errText").text("Incorrect password");
    }
  });
});

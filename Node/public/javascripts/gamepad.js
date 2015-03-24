function initGamepad() {

  var changeState = function() {
    gui.__folders.Base.__controllers[0].__onChange();
  }

  gamepad.firstState = function() {
    return this.gamepads[Object.keys(this.gamepads)[0]].state;
  }

  gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    logToTable('gamepad', 'Gamepad connected');
    if (typeof gui.gamepadStarted == 'undefined')
      initGamepadGUI();
  });

  gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    logToTable('gamepad', 'Gamepad disconnected');
  });

  gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
    //console.log(e.control);
    switch (e.control) {
      case "DPAD_UP":
        configs.base.posY += 5; 
        break;
      case "DPAD_DOWN":
        configs.base.posY -= 5;
        break; 
      case "DPAD_LEFT":
        configs.base.posX -= 5;
        break; 
      case "DPAD_RIGHT":
        configs.base.posX += 5;
        break;
    }
    //changeState();
  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    var def = true;
    var s = gamepad.firstState();
    //console.log(s.LEFT_STICK_X);
    switch (e.axis) {
      //console.log(e.axis);
      case "LEFT_STICK_X":
      case "LEFT_STICK_Y":
        var a = Math.atan2(-s.LEFT_STICK_Y, -s.LEFT_STICK_X) * 180 / 3.1415 - 90;
        if (a < 0)
          a += 360;
        configs.base.walkAngle = a;
        var d = Math.sqrt(Math.pow(s.LEFT_STICK_X, 2) + Math.pow(s.LEFT_STICK_Y, 2));
        configs.base.radius = d;
        def = false;
        break;
      case "RIGHT_STICK_Y":
          configs.base.rotY = scale(e.value, 1, -1, -15, 15);
        break;
      case "RIGHT_STICK_X":
        configs.base.rotX = scale(e.value, -1, 1, -15, 15);
        break;
      case "LEFT_BOTTOM_SHOULDER":
      case "RIGHT_BOTTOM_SHOULDER":
        if (s.RIGHT_TOP_SHOULDER == 1)
          configs.base.rotZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -15, 15);  
        else
          configs.base.posZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -40, 40);
        break;
    }
    //console.log(['def', def]);
    if (def) {
      console.log('changeSTATE WITH SHOULDER')
      socket.emit('changeState', configs.base);
    }
    else
      socket.emit('walk', {a: configs.base.walkAngle, r: configs.base.radius});
  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
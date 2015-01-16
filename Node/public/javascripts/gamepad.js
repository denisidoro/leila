function initGamepad() {

  gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    logToTable('gamepad', 'Gamepad connected');
    if (typeof gui.gamepadStarted == 'undefined')
      initGamepadGUI();
  });

  gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    logToTable('gamepad', 'Gamepad disconnected');
  });

  gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
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
  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    var s = gamepad.gamepads[0].state;
    switch (e.axis) {
      case "LEFT_STICK_X":
      case "LEFT_STICK_Y":
        var a = Math.atan2(-s.LEFT_STICK_Y, s.LEFT_STICK_X) * 180 / 3.1415 - 90;
        if (a < 0)
          a += 360;
        configs.base.walkAngle = a;
        var d = Math.sqrt(Math.pow(s.LEFT_STICK_X, 2) + Math.pow(s.LEFT_STICK_Y, 2));
        configs.base.stepSize = scale(d, 0, Math.sqrt(2) * 0.95, 30, 200);
        break;
      case "RIGHT_STICK_Y":
          configs.base.rotY = scale(e.value, 1, -1, -20, 20);
        break;
      case "RIGHT_STICK_X":
        configs.base.rotX = scale(e.value, -1, 1, -20, 20);
        break;
      case "LEFT_BOTTOM_SHOULDER":
      case "RIGHT_BOTTOM_SHOULDER":
        if (e.gamepad.state.RIGHT_TOP_SHOULDER == 1)
          configs.base.rotZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -20, 20);  
        else
          configs.base.posZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -150, 150);
        break;
    }
  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
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
    console.log('button');
  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    switch (e.axis) {
      case "RIGHT_STICK_Y":
        if (e.gamepad.state.RIGHT_TOP_SHOULDER == 1)
          configs.base.rotZ = scale(e.value, 1, -1, -90, 90);
        else
          configs.base.rotY = scale(e.value, 1, -1, -90, 90);
        break;
      case "RIGHT_STICK_X":
        configs.base.rotX = scale(e.value, -1, 1, -90, 90);
        break;
    }
  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
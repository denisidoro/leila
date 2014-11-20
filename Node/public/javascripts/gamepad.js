function initGamepad() {

  gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    logToTable('gamepad', 'Gamepad connected');
    if (typeof gui.gamepadStarted == 'undefined')
      initGamepadGUI();
  });

  gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    console.log('gamepad', 'Gamepad disconnected');
  });

  gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
    randomLED();
  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    switch (e.axis) {
      case "RIGHT_STICK_Y":
        if (e.gamepad.state.RIGHT_TOP_SHOULDER == 1)
          hexapod.baseRotZ = scale(e.value, 1, -1, -90, 90);
        else
          hexapod.baseRotY = scale(e.value, 1, -1, -90, 90);
        break;
      case "RIGHT_STICK_X":
        hexapod.baseRotX = scale(e.value, -1, 1, -90, 90);
        break;
    }
  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
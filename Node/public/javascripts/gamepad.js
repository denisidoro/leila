function initGamepad() {

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

    switch (e.control) {

      case "FACE_1": // button A
        socket.emit('walk', {toggle: true});
        break;

    }

  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {

    var s = gamepad.firstState();

    switch (e.axis) {

      case "LEFT_STICK_X":
      case "LEFT_STICK_Y":
        socket.emit('walk', {x: s.LEFT_STICK_X, y: s.LEFT_STICK_Y});
        break;

    }

  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
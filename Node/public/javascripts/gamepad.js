function initGamepad() {

  gamepad.firstState = function() {
    return this.gamepads[Object.keys(this.gamepads)[0]].state;
  }

  var changeState = function() {
    gui.__folders.Base.__controllers[0].__onChange();
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

      // button A: toggle movement
      case "FACE_1":
        socket.emit('walk', {toggle: true});
        break;

      // button X: keyframe snapshot
      case "FACE_3":
        snapshotKeyframe();
        break;

      // dpad: change base position
      case "DPAD_UP":
        configs.base.posY += 5; 
        changeState();
        break;
      case "DPAD_DOWN":
        configs.base.posY -= 5;
        changeState();
        break; 
      case "DPAD_LEFT":
        configs.base.posX -= 5;
        changeState();
        break; 
      case "DPAD_RIGHT":
        configs.base.posX += 5;
        changeState();
        break;

      // LB: init
      case "LEFT_TOP_SHOULDER":
        motionInit();
        break;

    }

  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {

    var s = e.gamepad.state;

    switch (e.axis) {

      // left analog: walk
      case "LEFT_STICK_X":
      case "LEFT_STICK_Y":
        socket.emit('walk', {x: s.LEFT_STICK_X, y: s.LEFT_STICK_Y});
        break;

      // right analog: rotate base X and Y
      case "RIGHT_STICK_Y":
        configs.base.rotX = scale(e.value, 1, -1, -15, 15);
        changeState();
        break;
      case "RIGHT_STICK_X":
        configs.base.rotY = scale(e.value, 1, -1, -15, 15);
        changeState();
        break;

      // LT and RT: rotate base Z if RB, change position Z if !RB
      case "LEFT_BOTTOM_SHOULDER":
      case "RIGHT_BOTTOM_SHOULDER":
        if (s.RIGHT_TOP_SHOULDER == 1)
          configs.base.rotZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -15, 15);  
        else
          configs.base.posZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -40, 40);
        changeState();
        break;

    }

  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
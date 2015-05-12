function initGamepad() {

  gamepad.currentServo = 0;

  gamepad.firstState = function() {
    return this.gamepads[Object.keys(this.gamepads)[0]].state;
  };

  var changeState = function() {
    gui.__folders.Base.__controllers[0].__onChange();
  };

  var changeServos = function() {
    gui.__folders.Servos.__controllers[0].__onChange();
  };

  var isSmall = function(values, eps) {
    var r = 0;
    if (!Array.isArray(values)) r = Math.abs(values);
    else {
      values.forEach(function(v) {
        r += Math.pow(v, 2);
      });
      r = Math.sqrt(r);   
    }
    return r < (eps || 0.2);
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

    var s = e.gamepad.state;

    switch (e.control) {

      // button A: toggle movement
      case "FACE_1":
        socket.emit('walk', {toggle: true});
        break;

      // button X: keyframe snapshot
      case "FACE_3":
        snapshotKeyframe();
        break;

      // dpad: change base position if !RB, change servo value if RB (even more if LB)
      case "DPAD_UP":
        if (s.RIGHT_TOP_SHOULDER != 1) { configs.base.posY += 5; changeState(); }
        else { configs.servos['servo' + gamepad.currentServo] += (s.LEFT_TOP_SHOULDER == 1 ? 40 : 10); changeServos(); }
        break;
      case "DPAD_DOWN":
        if (s.RIGHT_TOP_SHOULDER != 1) { configs.base.posY -= 5; changeState(); }
        else { configs.servos['servo' + gamepad.currentServo] -= (s.LEFT_TOP_SHOULDER == 1 ? 40 : 10); changeServos(); }
        break; 
      case "DPAD_LEFT":
        if (s.RIGHT_TOP_SHOULDER == 1) { gamepad.currentServo += (gamepad.currentServo == 0 ? 17 : -1); }
        else if (s.FACE_2 == 1) { semit("hex.Walk.turn(15, 10, false, true);"); }
        else { configs.base.posX -= 5; changeState(); }
        break;
      case "DPAD_RIGHT":
        console.log('right');
        if (s.RIGHT_TOP_SHOULDER == 1) { gamepad.currentServo += (gamepad.currentServo == 17 ? -17 : 1); }  
        else if (s.FACE_2 == 1) { semit("hex.Walk.turn(-15, 10, false, true);"); }
        else { configs.base.posX += 5; changeState(); }
        break;

      // Y: init
      case "FACE_4":
        motionInit();
        break;

      // B: turn 15o
      case "FACE_2":
        // + dpad left/right
        break;

    }

  });

  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {

    var s = e.gamepad.state;

    switch (e.axis) {

      // left analog: walk
      case "LEFT_STICK_X":
      case "LEFT_STICK_Y":
        if (isSmall([s.LEFT_STICK_X, s.LEFT_STICK_Y])) break;
        socket.emit('walk', {x: s.LEFT_STICK_X, y: s.LEFT_STICK_Y});
        break;

      // right analog: rotate base X and Y
      case "RIGHT_STICK_Y":
        if (isSmall(e.value)) break;
        configs.base.rotX = scale(e.value, 1, -1, -9, 9);
        //console.log("RSY");
        changeState();
        break;
      case "RIGHT_STICK_X":
        if (isSmall(e.value)) break;
        configs.base.rotY = scale(e.value, 1, -1, -9, 9);
        //console.log("RSx");
        changeState();
        break;

      // LT and RT: rotate base Z if RB, change position Z if !RB
      case "LEFT_BOTTOM_SHOULDER":
      case "RIGHT_BOTTOM_SHOULDER":
        if (s.RIGHT_TOP_SHOULDER == 1)
          configs.base.rotZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -15, 15);  
        else
          configs.base.posZ = scale(-s.LEFT_BOTTOM_SHOULDER + s.RIGHT_BOTTOM_SHOULDER, -1, 1, -40, 40);
        //console.log("LBRB");
        changeState();
        break;

    }

  });

  if (!gamepad.init()) {
    alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }

}
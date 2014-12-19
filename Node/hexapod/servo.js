var Servo = function(id) {
    this.id = (typeof id == 'undefined') ? Servo.list.length : id;
    this.position = 512;
    this.speed = 0;
    this.load = 0;
    this.temperature = 0;
    this.voltage = 0;
    this.moving = false;
};

Servo.list = [];
Servo.defaultSpeed = 1023;
  
Servo.add = function(n) {
  n = n || 1;
  for (var i = 0; i < n; i++)
    Servo.list.push(new Servo());
};

Servo.remove = function(index) {
  Servo.list.splice(index, 1);
};

Servo.get = function(code) {

  var res = [], v = {};

  Servo.list.forEach(function(s, i) {

	  switch (code) {
      case 0:             v = s.id;          break;
      case c.POSITION:    v = s.position;    break;
      case c.SPEED:       v = s.speed;       break;
      case c.LOAD:        v = s.load;        break;
      case c.VOLTAGE:     v = s.voltage;     break;
      case c.TEMPERATURE: v = s.temperature; break;
      case c.MOVING:      v = s.moving;      break;
    }

	  if (v)
    	res.push(v);

  });
  
  return res;

}

Servo.set = function(code, data) {
  
  Servo.list.forEach(function(s, i) {
  	switch (code) {
  		case c.POSITION: 		s.position 		= data[i]; break;
  		case c.SPEED: 			s.speed 			= data[i]; break;
  		case c.LOAD: 				s.load 				= data[i]; break;
  		case c.VOLTAGE: 		s.voltage 		= data[i]; break;
  		case c.TEMPERATURE: s.temperature = data[i]; break;
  	}
  });

}

Servo.prototype.move = function(pos, speed) {

  if (!board.isReady)
    return false;

  board.io.sysex(c.MOVE_AX12, [this.id + 1, pos, speed || Servo.defaultSpeed], [1, 2]);

}

Servo.moveAll = function(pos, speed) {

	pos = pos || Servo.get(c.POSITION);

  if (!board.isReady)
    return false;

  board.io.sysex(c.MOVE_AX12, pos.concat(speed || Servo.defaultSpeed), [0, 18], true);
  
}


module.exports = Servo;

// Libraries
var utils = require('./utils'),
  Servo = utils.require('servo'),
  Motion = utils.require('motion'),
  Animation = utils.require('animation');

var Movement = {

  walk: function() {
    Motion.tripodSimpleWalk.apply(this, arguments);
  },

  moveToInit: function() {
    Motion.moveToInit();
  },

  allEqual: function(amplitude) {
    var amplitude = amplitude || 0;
    //console.log(amplitude)
    var min = 512 - amplitude/2, max = 512 + amplitude/2;
    var p = Math.floor(Math.random() * (max - min + 1)) + min;
    var pos = [];
    for (var i = 0; i < 18; i++)
      pos.push(p);
    Servo.moveAll(pos);
  },

  raise: function() {
    Servo.moveAll([512,557,280,512,557,280,512,555,270,512,555,270,512,557,279,512,557,279]);
  }

};

module.exports = Movement;
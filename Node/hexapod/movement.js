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

  allEqual: function(args, amplitude) {

    if (!Array.isArray(args))
      args = [args];

    var pos = [];

    args.forEach(function(n) {
      if (amplitude > 0) {
        //console.log(amplitude)
        var min = n - amplitude/2, max = n + amplitude/2;
        var p = Math.floor(Math.random() * (max - min + 1)) + min;
        pos.push(p);     
      }
      else
        pos.push(n);
    });

    var p = [];
    for (var i = 0; i < 18; i++)
      p.push(pos[i%pos.length]);
    //console.log(p);
    Servo.moveAll(p);

  },

  raise: function() {
    Servo.moveAll([512,557,280,512,557,280,512,555,270,512,555,270,512,557,279,512,557,279]);
  }

};

module.exports = Movement;
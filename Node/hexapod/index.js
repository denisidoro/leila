global.hex = {};

var classes = [
	{name: 'c', file: './constants'},
	{name: 'Servo', file: './servo'},
	{name: 'Animation', file: './animation'},
	{name: 'Motion', file: './motion'},
	{name: 'Walk', file: './walk', instance: true},
	{name: 'Movement', file: './movement'},
	{name: 'Accel', file: './adxl345', instance: true},
	{name: 'Base', file: './base'},
	{name: 'Kalman', file: './kalman'},
	{name: 'KalmanAngle', file: './kalmanAngle'}
];

classes.forEach(function(cls) {
	global.hex[cls.name] = cls.instance ? new (require(cls.file)) : require(cls.file);
});

delete classes;
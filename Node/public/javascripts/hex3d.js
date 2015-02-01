/* ==============
 * LEG
 * =========== */

var Leg = function() {
	
	this.mesh = createLeg();

	this.move = function(pos) { 
		this.mesh.children[0].rotation.y = pos[0];
		this.mesh.children[0].children[0].rotation.z = pos[1];
		this.mesh.children[0].children[0].children[0].rotation.z = pos[2];
	}

	function createLeg() {

		var leg = new THREE.Object3D();
		var parent = leg;

		var	cubes = [], sizes = [];

		for (var i = 0; i < 3; i++) {

			sizes.push(Leg.constants.sizes[i]*Leg.constants.scale);

			var geometry = new THREE.BoxGeometry(sizes[i], 1, 1 );
			geometry.applyMatrix( new THREE.Matrix4().makeTranslation(sizes[i]/2, 0, 0 ) );
			var material = new THREE.MeshBasicMaterial( { 
				color: Leg.constants.colors[i],
				wireframe: true
			} );
			var cube = new THREE.Mesh( geometry, material );

			cube.position.set((i > 0 ? sizes[i-1] : 0), 0, 0);
			parent.add(cube);
			parent = cube;

		}

		// add reference
		leg.add(Leg.createReference());

		return leg;

	};

};

Leg.createReference = function() {

	var geometry = new THREE.SphereGeometry(0.05, 3);
	var material = new THREE.MeshBasicMaterial( { 
		color: 0xffffff,
		wireframe: true
	} );
	var sphere = new THREE.Mesh( geometry, material );
	return sphere;

}

Leg.constants = {
	sizes: [52, 84, 142.6], 
	colors: [0x00ff00, 0xff0000, 0x0000ff],
	scale: 1.7/52
};



/* ==============
 * Hexapod
 * =========== */

var Hexapod = function() {

	var self = this;
	this.legs = [];
	this.pos = [];
	this.t = {};
	this.mesh = createMesh();

	this.move = function(pos) {

		this.pos = jQuery.extend({}, pos);
		pos.forEach(function(p, i) {
			configs.servos['servo'+i] = p;
		});

		for (var i = 0; i < pos.length; i++)
			pos[i] = bitsToRadians(pos[i], i%3 == 2);

		for (var i = 0; i < self.legs.length; i++)
			self.legs[i].move(pos.slice(3*i, 3*i + 3));

	}

	this.animate = function(target, duration) {

		var duration = duration || 200;
		var pos0 = this.pos;
		var deltaT = 25, iteration = 0, totalIterations = duration/deltaT;

		clearInterval(this.t);
		t = setInterval(function() {
			var pos = [];
			for (var i = 0; i < target.length; i++)
				pos.push((target[i] - pos0[i])*(iteration/totalIterations) + pos0[i]);
			self.move(pos);
			iteration++;
			if (iteration > totalIterations)
				clearInterval(t);
		}, deltaT);

		this.t = t;

	}

	function createHead(x) {

		var geometry = new THREE.SphereGeometry(0.6);
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, x/8, x));
		var material = new THREE.MeshBasicMaterial( { 
			color: 0xffd0ff,
			wireframe: true
		} );
		var head = new THREE.Mesh( geometry, material );
		return head;

	}

	function createBase() {

		var geometry = new THREE.SphereGeometry(1, 6);
		var material = new THREE.MeshBasicMaterial( { 
			color: 0xffd0ff,
			wireframe: true
		} );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.scale.set(x[0]*1.2, 0.5, x[2]*1.2);
		return sphere;

	}

	function createMesh() {

		x = [133.6, 90.41, 130.41];
		for (var i = 0; i < 3; i++)
			x[i] *= Leg.constants.scale;

		var pos = [
			[-x[1], x[2]],
			[x[1], x[2]],
			[-x[0], 0],
			[x[0], 0],
			[-x[1], -x[2]],
			[x[1], -x[2]],
		];

		var h = new THREE.Object3D();

		h.add(createBase());
		h.add(createHead(x[2]));

		for (var i = 0; i < 6; i++) {
			var leg = new Leg();
			leg.mesh.position.x = pos[i][0];
			leg.mesh.position.z = pos[i][1];
			leg.mesh.rotation.y = Math.atan2(-pos[i][1], pos[i][0]);
			h.add(leg.mesh);
			self.legs.push(leg);
		}

		for (var i = 0; i < 18; i++)
			self.pos.push(512);

		return h;

	}

	function bitsToRadians(bits, invert) {
		if (invert)
			bits = 1023 - bits;
		return (300/1023)*(512-bits)*(3.1415/180);
	}

};



/* ==============
 * Utils
 * =========== */

var Utils = {

	buildAxes: function( length ) {

	    var axes = new THREE.Object3D();

	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
	    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

	    return axes;

		function buildAxis( src, dst, colorHex, dashed ) {

		    var geom = new THREE.Geometry(),
		        mat; 

		    if(dashed) {
		            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
		    } else {
		            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
		    }

		    geom.vertices.push( src.clone() );
		    geom.vertices.push( dst.clone() );
		    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

		    var axis = new THREE.Line( geom, mat, THREE.LinePieces );

		    return axis;

		}

	},	

};
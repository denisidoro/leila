/* ==============
 * LEG
 * =========== */

var Leg = function() {
	
	this.mesh = createLeg();

	this.move = function(pos) { 
		if (pos[0] != null) this.mesh.children[0].rotation.y = pos[0];
		if (pos[1] != null) this.mesh.children[0].children[0].rotation.z = pos[1];
		if (pos[2] != null) this.mesh.children[0].children[0].children[0].rotation.z = pos[2];
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

		pos.forEach(function(p, i) {
			if (p != null)
				self.pos[i] = p;
			configs.servos['servo'+i] = p;
		});

		for (var i = 0; i < pos.length; i++)
			if (pos[i] != null)
				pos[i] = bitsToRadians(pos[i], i%3 == 2);

		for (var i = 0; i < self.legs.length; i++)
			self.legs[i].move(pos.slice(3*i, 3*i + 3));

	}

	this.animate = function(target, duration) {

		var duration = duration || 200;
		var pos0 = target.length == 3 ? Utils.vectorToArray(self.mesh.position) : this.pos;
		var deltaT = 25, iteration = 0, totalIterations = duration/deltaT;

		clearInterval(this.t);
		t = setInterval(function() {

			if (target.length == 3) { // translate

				var p = [];
				for (var i = 0; i < 3; i++)
					p.push((target[i] - pos0[i])*(iteration/totalIterations) + pos0[i]);
				self.mesh.position.set(p[0], p[1], p[2]);

			}

			else { // move

				var pos = [];
				for (var i = 0; i < 18; i++)
					pos.push(isNaN(target[i]) ? null : (target[i] <= 0 ? null : (target[i] - pos0[i])*(iteration/totalIterations) + pos0[i]));
				//console.log(pos);
				self.move(pos);

			}

			iteration++;
			if (iteration > totalIterations)
				clearInterval(t);

		}, deltaT);

		this.t = t;

		this.updateHeight();

	}

	this.updateHeight = function() {

		if (!terrain)
			return false;
 		
 		// update Leila's vertical position
 		var v = terrain.vertexFromCoordinates(self.mesh.position.x, self.mesh.position.z, false, true);
 		//console.log(v);
    	self.mesh.position.y = v.z + 3.5;

	}


	function createHead(x) {

		var geometry = new THREE.SphereGeometry(0.6);
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, x/8, x));
		var material = new THREE.MeshBasicMaterial( { 
			color: 0xfffDf2,
			wireframe: true
		} );
		var head = new THREE.Mesh( geometry, material );
		return head;

	}

	function createBase() {

		var geometry = new THREE.SphereGeometry(1, 6);
		var material = new THREE.MeshBasicMaterial( { 
			color: 0xfffDf2,
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
			[x[1], x[2]],
			[-x[1], x[2]],
			[x[0], 0],
			[-x[0], 0],
			[x[1], -x[2]],
			[-x[1], -x[2]],
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
 * Terrain
 * =========== */

 var Terrain = function(width, height, widthSegments, heightSegments) {

 	var self = this;
 	this.width = width || 200;
 	this.height = height || this.width;
 	this.widthSegments = widthSegments || 100;
 	this.heightSegments = heightSegments || this.widthSegments;
 	this.heightmap = {};
 	this.mesh = createTerrain();

 	function createTerrain() {
		
		var geometry = new THREE.PlaneGeometry(self.width, self.height, self.widthSegments, self.heightSegments);
		var material = new THREE.MeshBasicMaterial({
			color: 0xE0C8F1,
			transparent: true,
			wireframe: true,
			opacity: 0.15
		});    

		var mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = -3.14/2;
		return mesh;

 	}

 	function changeCoordinates(x, y) {

 		// find (x, y) of the center of the plane
 		var yCenter = self.widthSegments / 2, xCenter = self.widthSegments / 2;

 		// coordinate system change (center -> top left)
 		var xtemp = x;
 		x = xCenter - y;
 		y = yCenter - xtemp;

 		return {x: x, y: y};

 	}

 	this.vertexFromCoordinates = function(x, y, id, changeCoord) {
 		
 		if (changeCoord) {
 			var p = changeCoordinates(x, y);
 			x = p.x; y = p.y;
 		}

 		var n = Math.round((1 + self.widthSegments) * x + y);
 		console.log(n);
 		return id ? n : self.mesh.geometry.vertices[n];

 	}

 	this.updateHeightmap = function(x, y, z, amp, factor) {

 		// coordinate system change (center -> top left)
		var p = changeCoordinates(x, y);
		x = p.x; y = p.y;
		console.log(p);

 		// define constants
 		amp = amp || Math.round(Math.sqrt(self.widthSegments * self.heightSegments) / 15);
 		factor = factor || 0.80;

 		// raise the desired point and neighbourhood (points p)
 		var xp, yp, n;
 		for (var i = -amp; i < amp; i++) {
 			for (var j = -(amp - Math.abs(i)); j <= amp - Math.abs(i); j++) {
 				xp = x + i;
 				yp = y + j;
 				n = self.vertexFromCoordinates(xp, yp, true);
 				if (!(xp < 0 || yp < 0 || xp > self.widthSegments || yp > self.heightSegments || (i != 0 && j != 0 && n in self.heightmap))) {
 					self.mesh.geometry.vertices[n].z = z * Math.pow(factor, i*i + j*j);
 					if (i == 0 && j == 0)
 						self.heightmap[n] = true;
 				}
 			}
 		}

 		self.mesh.geometry.verticesNeedUpdate = true;

 		if (model)
 			model.updateHeight();

 	}

 }



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

	vectorToArray: function(v) {
		return [v.x, v.y, v.z];
	}

};
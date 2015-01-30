function init3d() {

	var width = window.innerWidth, height = window.innerHeight;

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 10, width/height, 1, 10000 );
	var controls;

	var renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize(width, height);
	document.getElementById('threejs').appendChild( renderer.domElement );

	camera.position.set(  80, 80, 110 );
	camera.lookAt( scene.position );

	//scene.add(Utils.buildAxes(10));
	model = new Hexapod();
	scene.add(model.mesh);

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.noZoom = true;
	controls.damping = 20;
	//controls.addEventListener( 'change', render );

	render = function () {
		requestAnimationFrame(render);
		//controls.update();
		renderer.render(scene, camera);
	};

	render();

};

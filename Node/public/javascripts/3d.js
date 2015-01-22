$(document).ready(function() {


			var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
			var controls;

			var renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth * .3, window.innerHeight * .3 );
			document.getElementById('threejs').appendChild( renderer.domElement );

			camera.position.x = 3;
			camera.position.y = 6;
			camera.position.z = 10;

			// scene.add(Utils.buildAxes(10));
			model = new Hexapod();
			scene.add(model.mesh);

			controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.damping = 0.2;
			//controls.addEventListener( 'change', render );

			var render = function () {
				requestAnimationFrame( render );
				controls.update();

				//cube.rotation.x += 0.1;
				//cube.rotation.y += 0.1;

				renderer.render(scene, camera);
			};

			render();

});

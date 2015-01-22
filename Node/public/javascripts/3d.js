$(document).ready(function() {


			var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
			var controls;

			var renderer = new THREE.WebGLRenderer({alpha: true});
			renderer.setSize( window.innerWidth * .4, window.innerHeight * .4 );
			document.getElementById('threejs').appendChild( renderer.domElement );

			camera.position.x = 5;
			camera.position.y = 8;
			camera.position.z = 15;

			//scene.add(Utils.buildAxes(10));
			model = new Hexapod();
			scene.add(model.mesh);

			controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.damping = 0.2;
			//controls.addEventListener( 'change', render );

			var render = function () {
				requestAnimationFrame(render);
				controls.update();
				renderer.render(scene, camera);
			};

			render();

});

function initSocket() {

	socket = io()

	socket.on('testmessage', function(msg) {
		alert(msg);
	});

}

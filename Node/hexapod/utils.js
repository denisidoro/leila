module.exports = {

	require: function(filename) {

		var m;
		if (filename.indexOf('.js') == -1)
			filename += ".js";

		module.parent.children.forEach(function(c) {
			if (c.id.indexOf(filename) > -1) {
				m = c.exports;
				return false; 
			}
		})

		return m;

	}
	
}

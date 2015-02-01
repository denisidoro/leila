var ServoUtils = {

	// get complementar angles
	reflect: function(x, swap) {

		if (swap)
			x = ServoUtils.swap(x);

		if (Array.isArray(x)) {
			for (var i = 0; i < x.length; i++)
			  x[i] = ServoUtils.reflect(x[i]);
			return x;
		}
		else
			return 1023 - x;

	},

	// swap information for moveAll() in case of reflection
	swap: function(x) {

		var y = [];

		for (var i = 0; i < 18; i++)
			y.push(x[i + ((i%3)%2 == i%2 ? 3 : -3)]);

		return y;
		
	}

}

module.exports = ServoUtils;
const vec2 = {
	add(a, b) {
		return [a[0] + b[0], a[1] + b[1]];
	},

	div(a, b) {
		return [a[0] / b, a[1] / b];
	},

	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1];
	},

	lerp(a, b, c) {
		return [ a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]) ];
	},

	mul(a, b) {
		return [a[0] * b, a[1] * b];
	},

	nrm(v) {
		const { div, length } = this;
		return div(v, length(v));
	},

	sub(a, b) {
		return [a[0] - b[0], a[1] - b[1]];
	},

	length(v) {
		return Math.sqrt(v[0] ** 2 + v[1] ** 2);
	},

	cross(a, b) {
		return a[0] * b[1] - a[1] * b[0];
	}
};

vec2.nrm = vec2.nrm.bind(vec2);

export default vec2;

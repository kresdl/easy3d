const vec = {
	add(a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	},

	cross(a, b) {
		const x = a[1] * b[2] - a[2] * b[1];
		const y = a[2] * b[0] - a[0] * b[2];
		const z = a[0] * b[1] - a[1] * b[0];
		return [x, y, z];
	},

	div(a, b) {
		return [a[0] / b, a[1] / b, a[2] / b];
	},

	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},

	lerp(a, b, c) {
		return [a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]), a[2] + c * (b[2] - a[2])];
	},

	mul(a, b) {
		return [a[0] * b, a[1] * b, a[2] * b];
	},

	nrm(a) {
		const { div, length } = this;
		return div(a, length(a));
	},

	sub(a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	},

	length(v) {
		return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
	},

	tc(v, m) {
		return [
			v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0],
			v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1],
			v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2]
		];
	},

	tn(n, m) {
		return [
			n[0] * m[0][0] + n[1] * m[1][0] + n[2] * m[2][0],
			n[0] * m[0][1] + n[1] * m[1][1] + n[2] * m[2][1],
			n[0] * m[0][2] + n[1] * m[1][2] + n[2] * m[2][2]
		];
	}
};

vec.nrm = vec.nrm.bind(vec);

export default vec;

import vec from './vec.js';

const mat = {
	get id() {
		return [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
	},

	r(x, y, z) {
		const { rx, ry, rz, mul } = this;
		const m1 = rx(x);
		const m2 = ry(y);
		const m3 = rz(z);
		return mul(mul(m1, m2), m3);
	},

	rx(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[1][1] = cos;
		m[2][1] = -sin;

		m[1][2] = sin;
		m[2][2] = cos;
		return m;
	},

	ry(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[0][0] = cos;
		m[2][0] = -sin;

		m[0][2] = sin;
		m[2][2] = cos;
		return m;
	},

	rz(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[0][0] = cos;
		m[1][0] = -sin;

		m[0][1] = sin;
		m[1][1] = cos;
		return m;
	},

	s(x, y, z) {
		const m = this.id;
		m[0][0] = x;
		m[1][1] = y;
		m[2][2] = z;
		return m;
	},

	t(x, y, z) {
		const m = this.id;
		m[3][0] = x;
		m[3][1] = y;
		m[3][2] = z;
		return m;
	},

	arb(a, b, angle) {
		const { mul, rz, inv, view } = this;
		const v = view(a, b);
		return mul(mul(v, rz(angle)), inv(v));
	},

	view(pos, target) {
		const { nrm, cross, sub, dot } = vec;
		const z = nrm(sub(target, pos));
		const x = nrm(cross(z, [0, 1, 0]));
		const y = cross(x, z);
		const m = this.id;
		m[0][0] = x[0];
		m[1][0] = x[1];
		m[2][0] = x[2];
		m[3][0] = -dot(pos, x);

		m[0][1] = y[0];
		m[1][1] = y[1];
		m[2][1] = y[2];
		m[3][1] = -dot(pos, y);

		m[0][2] = z[0];
		m[1][2] = z[1];
		m[2][2] = z[2];
		m[3][2] = -dot(pos, z);
		return m;
	},

	glView(pos, target) {
		const { nrm, cross, sub, dot } = vec;
		const z = nrm(sub(pos, target));
		const x = nrm(cross([0, 1, 0], z));
		const y = cross(z, x);
		const m = this.id;
		m[0][0] = x[0];
		m[1][0] = x[1];
		m[2][0] = x[2];
		m[3][0] = -dot(pos, x);

		m[0][1] = y[0];
		m[1][1] = y[1];
		m[2][1] = y[2];
		m[3][1] = -dot(pos, y);

		m[0][2] = z[0];
		m[1][2] = z[1];
		m[2][2] = z[2];
		m[3][2] = -dot(pos, z);
		return m;
	},

	proj(zNear, zFar, fov, aspectRatio) {
		const m = this.id;
		const py = 1 / Math.tan(fov / 2);
		const px = py / aspectRatio;
		const pz = zFar / (zFar - zNear);
		m[0][0] = px;

		m[1][1] = -py;

		m[2][2] = pz;
		m[3][2] = -pz * zNear;

		m[2][3] = 1;
		m[3][3] = 0;
		return m;
	},

	glProj(zNear, zFar, fov, aspectRatio) {
		const m = this.id;
		const py = 1 / Math.tan(fov / 2);
		const px = py / aspectRatio;
		const pz = (zFar + zNear) / (zNear - zFar);
		m[0][0] = px;

		m[1][1] = py;

		m[2][2] = pz;
		m[3][2] = 2 * zNear * zFar / (zNear - zFar);

		m[2][3] = -1;
		m[3][3] = 0;
		return m;
	},

	mul(a, b) {
		const m = this.id;
		m[0][0] = b[0][0] * a[0][0] + b[1][0] * a[0][1] + b[2][0] * a[0][2] + b[3][0] * a[0][3];
		m[1][0] = b[0][0] * a[1][0] + b[1][0] * a[1][1] + b[2][0] * a[1][2] + b[3][0] * a[1][3];
		m[2][0] = b[0][0] * a[2][0] + b[1][0] * a[2][1] + b[2][0] * a[2][2] + b[3][0] * a[2][3];
		m[3][0] = b[0][0] * a[3][0] + b[1][0] * a[3][1] + b[2][0] * a[3][2] + b[3][0] * a[3][3];

		m[0][1] = b[0][1] * a[0][0] + b[1][1] * a[0][1] + b[2][1] * a[0][2] + b[3][1] * a[0][3];
		m[1][1] = b[0][1] * a[1][0] + b[1][1] * a[1][1] + b[2][1] * a[1][2] + b[3][1] * a[1][3];
		m[2][1] = b[0][1] * a[2][0] + b[1][1] * a[2][1] + b[2][1] * a[2][2] + b[3][1] * a[2][3];
		m[3][1] = b[0][1] * a[3][0] + b[1][1] * a[3][1] + b[2][1] * a[3][2] + b[3][1] * a[3][3];

		m[0][2] = b[0][2] * a[0][0] + b[1][2] * a[0][1] + b[2][2] * a[0][2] + b[3][2] * a[0][3];
		m[1][2] = b[0][2] * a[1][0] + b[1][2] * a[1][1] + b[2][2] * a[1][2] + b[3][2] * a[1][3];
		m[2][2] = b[0][2] * a[2][0] + b[1][2] * a[2][1] + b[2][2] * a[2][2] + b[3][2] * a[2][3];
		m[3][2] = b[0][2] * a[3][0] + b[1][2] * a[3][1] + b[2][2] * a[3][2] + b[3][2] * a[3][3];

		m[0][3] = b[0][3] * a[0][0] + b[1][3] * a[0][1] + b[2][3] * a[0][2] + b[3][3] * a[0][3];
		m[1][3] = b[0][3] * a[1][0] + b[1][3] * a[1][1] + b[2][3] * a[1][2] + b[3][3] * a[1][3];
		m[2][3] = b[0][3] * a[2][0] + b[1][3] * a[2][1] + b[2][3] * a[2][2] + b[3][3] * a[2][3];
		m[3][3] = b[0][3] * a[3][0] + b[1][3] * a[3][1] + b[2][3] * a[3][2] + b[3][3] * a[3][3];
		return m;
	},

	inv(m) {
		const a = this.id;
		const { dot } = vec;
		const p = [ m[3][0], m[3][1], m[3][2] ];
		a[0][0] = m[0][0];
		a[1][0] = m[0][1];
		a[2][0] = m[0][2];
		a[3][0] = -dot(p, [ m[0][0], m[0][1], m[0][2] ]);

		a[0][1] = m[1][0];
		a[1][1] = m[1][1];
		a[2][1] = m[1][2];
		a[3][1] = -dot(p, [ m[1][0], m[1][1], m[1][2] ]);

		a[0][2] = m[2][0];
		a[1][2] = m[2][1];
		a[2][2] = m[2][2];
		a[3][2] = -dot(p, [ m[2][0], m[2][1], m[2][2] ]);
		return a;
	},

	tp(m) {
		const t = this.id;
		t[0][0] = m[0][0];
		t[1][0] = m[0][1];
		t[2][0] = m[0][2];
		t[3][0] = m[0][3];

		t[0][1] = m[1][0];
		t[1][1] = m[1][1];
		t[2][1] = m[1][2];
		t[3][1] = m[1][3];

		t[0][2] = m[2][0];
		t[1][2] = m[2][1];
		t[2][2] = m[2][2];
		t[3][2] = m[2][3];

		t[0][3] = m[3][0];
		t[1][3] = m[3][1];
		t[2][3] = m[3][2];
		t[3][3] = m[3][3];
		return t;
	}
};

Object.keys(mat)
.filter(e => typeof mat[e] === 'function')
.forEach(e => {
	mat[e] = mat[e].bind(mat);
});

export default mat;

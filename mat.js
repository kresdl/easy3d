import { sub, cross, dot, nrm } from './vec.js';

export const id = () => [
	[1, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
];

export function rotate(x, y, z) {
	const m1 = rotateX(x),
	m2 = rotateY(y),
	m3 = rotateZ(z);
	return concat(concat(m1, m2), m3);
}

export function rotateX(r) {
	const m = id(),
	sin = Math.sin(r),
	cos = Math.cos(r);
	m[1][1] = cos;
	m[2][1] = -sin;

	m[1][2] = sin;
	m[2][2] = cos;
	return m;
}

export function rotateY(r) {
	const m = id(),
	sin = Math.sin(r),
	cos = Math.cos(r);
	m[0][0] = cos;
	m[2][0] = -sin;

	m[0][2] = sin;
	m[2][2] = cos;
	return m;
}

export function rotateZ(r) {
	const m = id(),
	sin = Math.sin(r),
	cos = Math.cos(r);
	m[0][0] = cos;
	m[1][0] = -sin;

	m[0][1] = sin;
	m[1][1] = cos;
	return m;
}

export function scale(x, y, z) {
	if (arguments.length === 1) {
		y = x;
		z = x;
	}
	const m = id();
	m[0][0] = x;
	m[1][1] = y;
	m[2][2] = z;
	return m;
}

export function translate(x, y, z) {
	const m = id();
	m[0][3] = x;
	m[1][3] = y;
	m[2][3] = z;
	return m;
}

export function arb(a, b, angle) {
	const v = view(a, b);
	return concat(concat(v, rotateZ(angle)), inverse(v));
}

export function view(pos, target) {
	const z = nrm(sub(target, pos)),
	x = nrm(cross(z, [0, 1, 0])),
	y = cross(x, z),
	m = id();
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
}

export function glView(pos, target) {
	const z = nrm(sub(pos, target)),
	x = nrm(cross([0, 1, 0], z)),
	y = cross(z, x),
	m = id();
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
}

export function proj(zNear, zFar, fov, aspectRatio) {
	const m = id(),
	py = 1 / Math.tan(fov / 2),
	px = py / aspectRatio,
	pz = zFar / (zFar - zNear);
	m[0][0] = px;

	m[1][1] = -py;

	m[2][2] = pz;
	m[3][2] = -pz * zNear;

	m[2][3] = 1;
	m[3][3] = 0;
	return m;
}

export function glProj(zNear, zFar, fov, aspectRatio) {
	const m = id(),
	py = 1 / Math.tan(fov / 2),
	px = py / aspectRatio,
	pz = (zFar + zNear) / (zNear - zFar);
	m[0][0] = px;

	m[1][1] = py;

	m[2][2] = pz;
	m[3][2] = 2 * zNear * zFar / (zNear - zFar);

	m[2][3] = -1;
	m[3][3] = 0;
	return m;
}

export function concat(a, b) {
	const m = id();
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
}

export function inverse(m) {
	const a = id();
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
}

export function transpose(m) {
	const t = id();
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

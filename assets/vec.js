export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const cross = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];

export const div = (a, b) => [a[0] / b, a[1] / b, a[2] / b];

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const lerp = (a, b, c) =>
	[a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]), a[2] + c * (b[2] - a[2])];

export const mul = (a, b) => [a[0] * b, a[1] * b, a[2] * b];

export const nrm = a => div(a, length(a));

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const length = v => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);

export const tfc = (v, m) => [
	v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0],
	v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1],
	v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2]
];

export const tfn = (n, m) => [
	n[0] * m[0][0] + n[1] * m[1][0] + n[2] * m[2][0],
	n[0] * m[0][1] + n[1] * m[1][1] + n[2] * m[2][1],
	n[0] * m[0][2] + n[1] * m[1][2] + n[2] * m[2][2]
];

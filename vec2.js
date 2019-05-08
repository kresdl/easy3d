export const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];

export const div2 = (a, b) => [a[0] / b, a[1] / b];

export const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];

export const lerp2 = (a, b, c) =>
	[ a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]) ];

export const mul2 = (a, b) => [a[0] * b, a[1] * b];

export const nrm2 = v => div(v, length(v));

export const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];

export const length2 = v => Math.sqrt(v[0] ** 2 + v[1] ** 2);

export const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];

import Mesh from './Mesh.js';

export default class Quad extends Mesh {
	constructor(gl, x = 0, y = 0, w = 1, h = 1) {
		const x1 = 2 * x - 1,
		y1 = 1 - 2 * y,
		x2 = x1 + 2 * w,
		y2 = y1 - 2 * h;

		super(gl, [
				x1,		y1,		0.0,
				0.0,		1.0,

				x2,		y1,		0.0,
				1.0,		1.0,

				x1,		y2,		0.0,
				0.0,		0.0,

				x2,		y2,		0.0,
				1.0,		0.0
		], [
				1,	0,	3,
				2,	3,	0
		], [
				3,	2
		]);
	}

	draw = () => {
		const { gl } = this;
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.DEPTH_TEST);
		gl.depthMask(false);
		this.drawElements();
	}
}
import Mesh from './Mesh.js';

const { assign } = Object;

export default class extends Mesh {
	constructor(gl) {
		super(gl, [
				-1.0,		1.0,		0.0,
				0.0,		1.0,

				1.0,		1.0,		0.0,
				1.0,		1.0,

				-1.0,		-1.0,		0.0,
				0.0,		0.0,

				1.0,		-1.0,		0.0,
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
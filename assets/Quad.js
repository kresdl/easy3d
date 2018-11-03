import Model from './Model.js';

const { assign } = Object;

function Quad(ctx) {
	Model.call(this, ctx, [
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

Quad.prototype = assign(Object.create(Model.prototype), {
	draw() {
		const { gl } = this;
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.DEPTH_TEST);
		gl.depthMask(false);
		this.drawElements();
	}
});

export default Quad;

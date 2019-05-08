import setBlendState from '../setBlendState.js';

const { assign } = Object,
{ isFinite } = Number;

export default class {
	constructor(canvas) {
		let gl = canvas.getContext('webgl2');
		if (!gl) throw 'Unable to create WebGL2 context';
		this.gl = gl;

		gl.depthFunc(gl.LEQUAL);
		gl.frontFace(gl.CCW);
	}

	draw = (model, prg, blend = false) => {
		const { gl, id } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
		gl.drawBuffers([gl.BACK]);
		setBlendState(gl, blend === true ? 'over' : blend);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		prg.use();
		model.draw();
		return this;
	}

	clear = (color = true, depth = true) => {
		const { gl } = this;
		color = color === true ? [0, 0, 0, 1] : color;
		depth = depth === true ? 1.0 : depth;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers([gl.BACK]);
		var clearBit = 0;
		if (color) {
			gl.clearColor(...color);
			clearBit = gl.COLOR_BUFFER_BIT;
		}
		if (depth) {
			gl.depthMask(true);
			gl.clearDepth(depth);
			clearBit = clearBit | gl.DEPTH_BUFFER_BIT;
		}
		gl.clear(clearBit);
		return this;
	}

	ext = name => {
		this.gl.getExtension(name);
	}
}
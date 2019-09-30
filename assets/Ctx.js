import Asset from './Asset';
import setBlendState from '../setBlendState.js';

const { assign } = Object,
{ isFinite } = Number;

export default class Ctx extends Asset {
	constructor(canvas) {
		super();
		let gl = canvas.getContext('webgl2');
		if (!gl) throw 'Unable to create WebGL2 context';

		Asset.pool.set(gl, new Set());
		this.gl = gl;

		gl.depthFunc(gl.LEQUAL);
		gl.frontFace(gl.CCW);
	}

	dispose = () => {
    const { gl } = this,
    numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    for (let unit = 0; unit < numTextureUnits; unit++) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    const { pool } = Asset,
    assets = [...pool.get(gl).keys()].reverse();
    console.log(assets);

    assets.forEach(asset => {
      asset.dispose();
    });

    pool.delete(gl);
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
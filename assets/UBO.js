import Buffer from './Buffer.js';

const { assign } = Object;

if (!Array.prototype.flatMap) {
	Array.prototype.flatMap = function(cb) {
		return this.reduce((array, e) => array.concat(cb(e)), []);
	};
}

function UBO(ctx, usage) {
	const { gl, map } = ctx;
	Buffer.call(this, ctx, gl.UNIFORM_BUFFER, usage);
	assign(this, {
		blockOffsets: {},
		uniformOffsets: {},
	});

	var t = 0, pt = 0;
	const a = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT);

	for (const block in map) {
		const blocksize = map[block][0].getBlockSize(block);
		t += blocksize + a - blocksize % a;
	}

	this.bind();
	this.storage(t);
	UBO.unbind(gl);
	t = 0;

	for (const block in map) {
		this[block] = {};
		this.blockOffsets[block] = t;

		const prgs = map[block];
		const blocksize = prgs[0].getBlockSize(block);

		gl.bindBufferRange(gl.UNIFORM_BUFFER, pt, this.id, t, blocksize);
		for (const pg of prgs) {
			gl.uniformBlockBinding(pg.id, pg.blocks[block], pt);
		}
		pt++;

		this.uniformOffsets[block] = {};

		for (const pg of prgs) {
			const uniforms = pg.getUniformOffsetMap(block);

			for (const uni in uniforms) {
				this.uniformOffsets[block][uni] = uniforms[uni] + t;
			}
		}
		t += blocksize + a - blocksize % a;
	}

	return new Proxy(this, {
		get: (tg, block) => {
			if (!this.has(block)) throw `No such shader block: ${block}`;
			return new Proxy({}, {
				set: (tg, uniform, val) => {
					this.setUniform(block, uniform, val);
					return true;
				}
			});
		},

		set: (tg, block, val) => {
			Object.keys(val).forEach(e => {
				this.setUniform(block, e, val[e]);
			});
			return true;
		}
	});
}

UBO.prototype = assign(Object.create(Buffer.prototype), {
	setUniform(block, uniform, val) {
		const offset = this.uniformOffsets[block][uniform];
		if (!this.has(block, uniform)) throw `No such shader uniform. Block: ${block}, uniform: ${uniform}`;
		if (Array.isArray(val) && Array.isArray(val[0])) {
			val = val.flatMap(e => e);
		} else if (typeof val === 'number') {
			val = [val];
		} else if (!Array.isArray(val)) {
			throw 'Type not allowed as uniform buffer data: ' + typeof val;
		}
		this.bind();
		this.subData(val, offset);
		UBO.unbind(this.gl);
	},

	has(block, uniform) {
		const offsets = this.uniformOffsets[block];
		return offsets && (!uniform || typeof offsets[uniform] !== 'undefined');
	}
});

UBO.unbind = gl => {
	Buffer.unbind(gl, gl.UNIFORM_BUFFER);
};

export default UBO;

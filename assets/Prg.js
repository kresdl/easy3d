import VS from './VS.js';
import FS from './FS.js';
import Asset from './Asset';

const { assign } = Object;

export default class Prg extends Asset {
	constructor(gl, vs, fs, map, ub) {
		super();
		const { attach, detach, use } = this,
		id = gl.createProgram();
		assign(this, {
			gl, id, map, ub,
			samplers: fs.samplers
		});

		Asset.pool.get(gl).add(this);

		attach(vs);
		attach(fs);

		vs.input.forEach((e, i) => {
			gl.bindAttribLocation(id, i, e);
		});

		gl.linkProgram(id);

		detach(vs);
		detach(fs);

		if (!gl.getProgramParameter(id, gl.LINK_STATUS)) {
			throw "Failed to link shader. " + gl.getProgramInfoLog(id, 1000);
		}

		// Get uniform blocks

		var blockCount = gl.getProgramParameter(id, gl.ACTIVE_UNIFORM_BLOCKS);

		if (blockCount) {
			this.blocks = {};
		}

		for (let i = 0; i < blockCount; i++) {
			const name = gl.getActiveUniformBlockName(id, i);
			this.blocks[name] = i;
			if (!map[name]) {
				map[name] = [this];
			} else {
				map[name].push(this);
			}
		}

		// Initialize samplers

		const { samplers } = this;

		use();

		if (samplers) {
			for (let i = 0; i < samplers.length; i++) {
				const n = samplers[i];
				gl.uniform1i(gl.getUniformLocation(id, n), i);
			}
		}
		Prg.unuse(gl);

		gl.validateProgram(id);

		if (!gl.getProgramParameter(id, gl.VALIDATE_STATUS)) {
			throw "Failed to validate shader. " + gl.getProgramInfoLog(id, 1000);
		}

		ub.configure();
	}

	get tex() {
		return new Proxy({}, {
			set: (tg, prop, val) => {
				this.setTexture(prop, val);
				return true;
			}
		});
	}

	set tex(t) {
		t.entries().forEach(([prop, val]) => {
			this.setTexture(prop, val);
		});
	}

	setTexture = (sampler, texture) => {
		const i = this.samplers.indexOf(sampler);
		if (i !== -1) {
			texture.bind(i);
		} else {
			throw `No such sampler as ${sampler} in program ${this}`;
		}
	}

	getBlockSize = block => {
		const { gl, id, blocks } = this;
		return gl.getActiveUniformBlockParameter(id, blocks[block], gl.UNIFORM_BLOCK_DATA_SIZE);
	}

	getUniformOffsetMap = block => {
		const { gl, id, blocks } = this,
		blockIndex = blocks[block],
		numUniforms = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS),

		indices = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
		offsets = gl.getActiveUniforms(id, indices, gl.UNIFORM_OFFSET),
		map = {};

		for (let i = 0; i < numUniforms; i++) {
			const n = gl.getActiveUniform(id, indices[i]).name.replace("[0]", "");
			map[n] = offsets[i];
		}
		return map;
	}

	use = () => {
		const { gl, id } = this;
		gl.useProgram(id);
	}

	attach = shader => {
		const { gl, id } = this;
		gl.attachShader(id, shader.id);
	}

	detach = shader => {
		const { gl, id } = this;
		gl.detachShader(id, shader.id);
	}

	dispose = () => {
		const { gl, id, vs, fs, detach, map, ub } = this;
		Prg.unuse(gl);
		gl.deleteProgram(id);
		Object.keys(this.blocks).forEach(name => {
			if (map[name].length === 1) {
				delete map[name];
			} else {
				map[name] = map[name].filter(e => e !== this);
			}
		});
		ub.configure();
		Asset.pool.get(gl).delete(this);
	}

	drop = () => {
		this.disposeAfterUse = true;
		return this;
	}

	static unuse = gl => {
		gl.useProgram(null);
	}

	static paste = (ctx, vs, map, ub) =>
		new Prg(
			ctx,
			vs,
			new FS(ctx,
`#version 300 es
precision mediump float;

uniform sampler2D col;

in vec2 f_tex;
out vec4 rgba;

void main() {
	rgba = texture(col, f_tex);
}`), map, ub)
}
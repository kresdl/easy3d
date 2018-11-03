import Shader from './Shader.js';

const { assign } = Object;

function Prg(ctx, vs, fs) {
	const { gl, prg } = ctx;
	const id = gl.createProgram();
	assign(this, {
		gl,	id,	vs,	fs,
		pool: prg.pool.add(this)
	});

	this.attach(vs);
	this.attach(fs);

	vs.input.forEach((e, i) => {
		gl.bindAttribLocation(id, i, e);
	});

	gl.linkProgram(id);

	if (!gl.getProgramParameter(id, gl.LINK_STATUS)) {
		throw "Failed to link shader. " + gl.getProgramInfoLog(id, 1000);
	}

	// Get uniform blocks

	var blockCount = gl.getProgramParameter(id, gl.ACTIVE_UNIFORM_BLOCKS);

	if (blockCount) {
		this.blocks = {};
		if (!ctx.map) {
			ctx.map = {};
		}
	}

	for (let i = 0; i < blockCount; i++) {
		const name = gl.getActiveUniformBlockName(id, i);
		this.blocks[name] = i;
		if (!ctx.map[name]) {
			ctx.map[name] = [this];
		} else {
			ctx.map[name].push(this);
		}
	}

	// Initialize samplers

	this.use();

	if (fs.samplers) {
		for (let i = 0; i < fs.samplers.length; i++) {
			const n = fs.samplers[i];
			gl.uniform1i(gl.getUniformLocation(id, n), i);
		}
	}
	Prg.unuse(gl);

	gl.validateProgram(id);

	if (!gl.getProgramParameter(id, gl.VALIDATE_STATUS)) {
		throw "Failed to validate shader. " + gl.getProgramInfoLog(id, 1000);
	}
}

Prg.prototype = {
	getBlockSize(block) {
		const { gl, id } = this;
		return gl.getActiveUniformBlockParameter(id, this.blocks[block], gl.UNIFORM_BLOCK_DATA_SIZE);
	},

	getUniformOffsetMap(block) {
		const { gl, id, blocks } = this;
		const blockIndex = blocks[block];
		const numUniforms = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS);

		const indices = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
		const offsets = gl.getActiveUniforms(id, indices, gl.UNIFORM_OFFSET);
		const map = {};

		for (let i = 0; i < numUniforms; i++) {
			const n = gl.getActiveUniform(id, indices[i]).name.replace("[0]", "");
			map[n] = offsets[i];
		}
		return map;
	},

	use() {
		const { gl, id } = this;
		gl.useProgram(id);
	},

	attach(shader) {
		const { gl, id } = this;
		gl.attachShader(id, shader.id);
	},

	detach(shader) {
		if (shader != null) {
			const { gl, id } = this;
			gl.detachShader(id, shader.id);
		}
	},

	dispose() {
		const { gl, id, vs, fs, pool } = this;
		Prg.unuse(gl);
		this.detach(vs);
		this.detach(fs);
		gl.deleteProgram(id);
		pool.delete(this);
	}
};

Prg.unuse = gl => {
	gl.useProgram(null);
};

Prg.paste = ctx => {
	const { gl } = ctx;
	return new Prg(ctx, new Shader(ctx,
`#version 300 es

in vec3 pos;
in vec2 tex;

out vec2 f_tex;

void main() {
f_tex = tex;
gl_Position = vec4(pos, 1.0);
}`
	, gl.VERTEX_SHADER), new Shader(ctx,
`#version 300 es
precision mediump float;

uniform sampler2D t;

in vec2 f_tex;
out vec4 col;

void main() {
col = texture(t, f_tex);
}`
	, gl.FRAGMENT_SHADER));
};

export default Prg;

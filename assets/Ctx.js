import FBO from './FBO.js';
import Quad from './Quad.js';
import Prg from './Prg.js';
import Buffer from './Buffer.js';
import VBO from './VBO.js';
import RBO from './RBO.js';
import IBO from './IBO.js';
import UBO from './UBO.js';
import Shader from './Shader.js';
import VS from './VS.js';
import FS from './FS.js';
import Model from './Model.js';
import Tex from './Tex.js';

const { assign } = Object;

function Ctx(canvas) {
	let gl = canvas.getContext('webgl2');
	if (!gl) throw 'Unable to create WebGL2 context';

	this.gl = gl;
	this.fb = new FBO(this);

	gl.depthFunc(gl.LEQUAL);
	gl.clearDepth(1.0);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.frontFace(gl.CCW);

	const proxy = new Proxy(this, {
		get: (tg, ns) => {
			if (ns === 'quad') {
				return new Quad(tg);
			} else if (ns === 'paste') {
				return Prg.paste(tg);
			} else {
				const x = tg[ns];
				const bound = typeof x === 'function' ? x.bind(tg) : x;
				tg[ns] = bound;
				Object.keys(x)
				.forEach(sub => {
					const f = x[sub];
					bound[sub] = typeof f === 'function' ? f.bind(this) : f;
				});
				return bound;
			}
		}
	});

	return proxy;
}

Ctx.prototype = {
	draw(model, prg) {
		const { gl, blend } = this;
		if (blend) {
			gl.enable(gl.BLEND);
		} else {
			gl.disable(gl.BLEND);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers([gl.BACK]);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		prg.use();
		model.draw();
	},

	clear(color = [0, 0, 0, 0], depth = true) {
		const { gl } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(...color);
		gl.drawBuffers([gl.BACK]);
		if (depth) {
			gl.depthMask(true);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		} else {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	},

	dispose() {
		[this.prg, this.shader, this.tex, this.vao, this.buf, this.fbo, this.rbo]
		.forEach(ns => { [...ns.pool.keys()].forEach(res => { res.dispose(); }) });
		this.fb.dispose();
	},

	ext(name) {
		this.gl.getExtension(name);
	},

	shader: assign(function(source, type) {
		return new Shader(this, source, this.s2e(type));
	}, {
		pool: new Set()
	}),

	vs: assign(function(src) {
		return new VS(this, src);
	}, {
		url(src, constants) {
			return Shader.url(this, src, this.gl.VERTEX_SHADER, constants);
		}
	}),

	fs: assign(function(src) {
		return new FS(this, src);
	}, {
		url(src, constants) {
			return Shader.url(this, src, this.gl.FRAGMENT_SHADER, constants);
		}
	}),

	prg: assign(function(v, f) {
		return new Prg(this, v, f);
	}, {
		unuse() {
			Prg.unuse(this.gl);
		},
		pool: new Set(),
	}),

	tex: assign(function(width, height, prop = {}) {
		const { gl } = this;
		const { fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, mips = false, wrap = gl.REPEAT } = this.s2e(prop);
		return new Tex(this, width, height, { fmt, srcFmt, type, mips, wrap });
	}, {
		url(url, prop = {}) {
			return Tex.url(this, url, this.s2e(prop));
		},
		data(data, prop = {}) {
			return Tex.data(this, data, this.s2e(prop));
		},
		pool: new Set()
	}),

	buf: assign(function(type, usage) {
		return new Buffer(this, this.s2e(type), this.s2e(usage));
	}, {
		pool: new Set()
	}),

	vbo: assign(function(usage = this.gl.STATIC_DRAW) {
		return new VBO(this, this.s2e(usage));
	}, {
		unbind() {
			VBO.unbind(this.gl);
		}
	}),

	ibo: assign(function(usage = this.gl.STATIC_DRAW) {
		return new IBO(this, this.s2e(usage));
	}, {
		unbind() {
			IBO.unbind(this.gl);
		}
	}),

	rbo: assign(function(w, h, fmt = this.gl.DEPTH24_STENCIL8) {
		return new RBO(this, w, h, this.s2e(fmt));
	}, {
		unbind() {
			RBO.unbind(this.gl);
		},
		pool: new Set()
	}),

	ubo: assign(function(usage = this.gl.DYNAMIC_DRAW) {
		return new UBO(this, this.s2e(usage));
	}, {
		unbind() {
			UBO.unbind(this.gl);
		}
	}),

	fbo: assign(function() {
		return new FBO(this);
	} , {
		unbind() {
			FBO.unbind(this.gl);
		},
		pool: new Set()
	}),

	vao: assign(function(indexCount, attrCount) {
		new VAO(this, indexCount, attrCount);
	}, {
		unbind() {
			VAO.unbind(this.gl);
		},
		pool: new Set()
	}),

	model: assign(function(vert, indices, layout) {
		new Model(this, vert, indices, layout);
	}, {
		url(obj, computeTangentFrame = true, scale = 1.0) {
			return Model.url(this, obj, computeTangentFrame, scale);
		}
	}),

	s2e(x) {
		if (typeof x === 'object') {
			Object.keys(x).forEach(e => {
				const y = x[e];
				if (typeof y === 'string') {
					x[e] = str2enum(this.gl, y);
				}
			});
		} else if (typeof x === 'string') {
			x = str2enum(this.gl, x);
		}
		return x;

		function str2enum(gl, str) {
			return gl[str.replace('-', '_').toUpperCase()];
		}
	}
};

export default Ctx;

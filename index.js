const { assign } = Object;

if (!Array.prototype.flatMap) {
	Array.prototype.flatMap = function(cb) {
		return this.reduce((array, e) => array.concat(cb(e)), []);
	};
}

const vec = {
	add(a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	},

	cross(a, b) {
		const x = a[1] * b[2] - a[2] * b[1];
		const y = a[2] * b[0] - a[0] * b[2];
		const z = a[0] * b[1] - a[1] * b[0];
		return [x, y, z];
	},

	div(a, b) {
		return [a[0] / b, a[1] / b, a[2] / b];
	},

	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},

	lerp(a, b, c) {
		return [a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]), a[2] + c * (b[2] - a[2])];
	},

	mul(a, b) {
		return [a[0] * b, a[1] * b, a[2] * b];
	},

	nrm(a) {
		const { div, length } = this;
		return div(a, length(a));
	},

	sub(a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	},

	length(v) {
		return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
	},

	tc(v, m) {
		return [
			v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0],
			v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1],
			v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2]
		];
	},

	tn(n, m) {
		return [
			n[0] * m[0][0] + n[1] * m[1][0] + n[2] * m[2][0],
			n[0] * m[0][1] + n[1] * m[1][1] + n[2] * m[2][1],
			n[0] * m[0][2] + n[1] * m[1][2] + n[2] * m[2][2]
		];
	}
};

Object.keys(vec)
.forEach(e => {
	vec[e] = vec[e].bind(vec);
});

const vec2 = {
	add(a, b) {
		return [a[0] + b[0], a[1] + b[1]];
	},

	div(a, b) {
		return [a[0] / b, a[1] / b];
	},

	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1];
	},

	lerp(a, b, c) {
		return [ a[0] + c * (b[0] - a[0]), a[1] + c * (b[1] - a[1]) ];
	},

	mul(a, b) {
		return [a[0] * b, a[1] * b];
	},

	nrm(v) {
		const { div, length } = this;
		return div(v, length(v));
	},

	sub(a, b) {
		return [a[0] - b[0], a[1] - b[1]];
	},

	length(v) {
		return Math.sqrt(v[0] ** 2 + v[1] ** 2);
	},

	cross(a, b) {
		return a[0] * b[1] - a[1] * b[0];
	}
};

Object.keys(vec2)
.forEach(e => {
	vec2[e] = vec2[e].bind(vec2);
});

const mat = {
	get id() {
		return [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
	},

	r(x, y, z) {
		const { rx, ry, rz, mul } = this;
		const m1 = rx(x);
		const m2 = ry(y);
		const m3 = rz(z);
		return mul(mul(m1, m2), m3);
	},

	rx(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[1][1] = cos;
		m[2][1] = -sin;

		m[1][2] = sin;
		m[2][2] = cos;
		return m;
	},

	ry(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[0][0] = cos;
		m[2][0] = -sin;

		m[0][2] = sin;
		m[2][2] = cos;
		return m;
	},

	rz(r) {
		const m = this.id;
		const sin = Math.sin(r);
		const cos = Math.cos(r);
		m[0][0] = cos;
		m[1][0] = -sin;

		m[0][1] = sin;
		m[1][1] = cos;
		return m;
	},

	s(x, y, z) {
		const m = this.id;
		m[0][0] = x;
		m[1][1] = y;
		m[2][2] = z;
		return m;
	},

	t(x, y, z) {
		const m = this.id;
		m[3][0] = x;
		m[3][1] = y;
		m[3][2] = z;
		return m;
	},

	arb(a, b, angle) {
		const { mul, rz, inv, view } = this;
		const v = view(a, b);
		return mul(mul(v, rz(angle)), inv(v));
	},

	view(pos, target) {
		const { nrm, cross, sub, dot } = vec;
		const z = nrm(sub(target, pos));
		const x = nrm(cross(z, [0, 1, 0]));
		const y = cross(x, z);
		const m = this.id;
		m[0][0] = x[0];
		m[1][0] = x[1];
		m[2][0] = x[2];
		m[3][0] = -dot(pos, x);

		m[0][1] = y[0];
		m[1][1] = y[1];
		m[2][1] = y[2];
		m[3][1] = -dot(pos, y);

		m[0][2] = z[0];
		m[1][2] = z[1];
		m[2][2] = z[2];
		m[3][2] = -dot(pos, z);
		return m;
	},

	glView(pos, target) {
		const { nrm, cross, sub, dot } = vec;
		const z = nrm(sub(pos, target));
		const x = nrm(cross([0, 1, 0], z));
		const y = cross(z, x);
		const m = this.id;
		m[0][0] = x[0];
		m[1][0] = x[1];
		m[2][0] = x[2];
		m[3][0] = -dot(pos, x);

		m[0][1] = y[0];
		m[1][1] = y[1];
		m[2][1] = y[2];
		m[3][1] = -dot(pos, y);

		m[0][2] = z[0];
		m[1][2] = z[1];
		m[2][2] = z[2];
		m[3][2] = -dot(pos, z);
		return m;
	},

	proj(zNear, zFar, fov, aspectRatio) {
		const m = this.id;
		const py = 1 / Math.tan(fov / 2);
		const px = py / aspectRatio;
		const pz = zFar / (zFar - zNear);
		m[0][0] = px;

		m[1][1] = -py;

		m[2][2] = pz;
		m[3][2] = -pz * zNear;

		m[2][3] = 1;
		m[3][3] = 0;
		return m;
	},

	glProj(zNear, zFar, fov, aspectRatio) {
		const m = this.id;
		const py = 1 / Math.tan(fov / 2);
		const px = py / aspectRatio;
		const pz = (zFar + zNear) / (zNear - zFar);
		m[0][0] = px;

		m[1][1] = py;

		m[2][2] = pz;
		m[3][2] = 2 * zNear * zFar / (zNear - zFar);

		m[2][3] = -1;
		m[3][3] = 0;
		return m;
	},

	mul(a, b) {
		const m = this.id;
		m[0][0] = b[0][0] * a[0][0] + b[1][0] * a[0][1] + b[2][0] * a[0][2] + b[3][0] * a[0][3];
		m[1][0] = b[0][0] * a[1][0] + b[1][0] * a[1][1] + b[2][0] * a[1][2] + b[3][0] * a[1][3];
		m[2][0] = b[0][0] * a[2][0] + b[1][0] * a[2][1] + b[2][0] * a[2][2] + b[3][0] * a[2][3];
		m[3][0] = b[0][0] * a[3][0] + b[1][0] * a[3][1] + b[2][0] * a[3][2] + b[3][0] * a[3][3];

		m[0][1] = b[0][1] * a[0][0] + b[1][1] * a[0][1] + b[2][1] * a[0][2] + b[3][1] * a[0][3];
		m[1][1] = b[0][1] * a[1][0] + b[1][1] * a[1][1] + b[2][1] * a[1][2] + b[3][1] * a[1][3];
		m[2][1] = b[0][1] * a[2][0] + b[1][1] * a[2][1] + b[2][1] * a[2][2] + b[3][1] * a[2][3];
		m[3][1] = b[0][1] * a[3][0] + b[1][1] * a[3][1] + b[2][1] * a[3][2] + b[3][1] * a[3][3];

		m[0][2] = b[0][2] * a[0][0] + b[1][2] * a[0][1] + b[2][2] * a[0][2] + b[3][2] * a[0][3];
		m[1][2] = b[0][2] * a[1][0] + b[1][2] * a[1][1] + b[2][2] * a[1][2] + b[3][2] * a[1][3];
		m[2][2] = b[0][2] * a[2][0] + b[1][2] * a[2][1] + b[2][2] * a[2][2] + b[3][2] * a[2][3];
		m[3][2] = b[0][2] * a[3][0] + b[1][2] * a[3][1] + b[2][2] * a[3][2] + b[3][2] * a[3][3];

		m[0][3] = b[0][3] * a[0][0] + b[1][3] * a[0][1] + b[2][3] * a[0][2] + b[3][3] * a[0][3];
		m[1][3] = b[0][3] * a[1][0] + b[1][3] * a[1][1] + b[2][3] * a[1][2] + b[3][3] * a[1][3];
		m[2][3] = b[0][3] * a[2][0] + b[1][3] * a[2][1] + b[2][3] * a[2][2] + b[3][3] * a[2][3];
		m[3][3] = b[0][3] * a[3][0] + b[1][3] * a[3][1] + b[2][3] * a[3][2] + b[3][3] * a[3][3];
		return m;
	},

	inv(m) {
		const a = this.id;
		const { dot } = vec;
		const p = [ m[3][0], m[3][1], m[3][2] ];
		a[0][0] = m[0][0];
		a[1][0] = m[0][1];
		a[2][0] = m[0][2];
		a[3][0] = -dot(p, [ m[0][0], m[0][1], m[0][2] ]);

		a[0][1] = m[1][0];
		a[1][1] = m[1][1];
		a[2][1] = m[1][2];
		a[3][1] = -dot(p, [ m[1][0], m[1][1], m[1][2] ]);

		a[0][2] = m[2][0];
		a[1][2] = m[2][1];
		a[2][2] = m[2][2];
		a[3][2] = -dot(p, [ m[2][0], m[2][1], m[2][2] ]);
		return a;
	},

	tp(m) {
		const t = this.id;
		t[0][0] = m[0][0];
		t[1][0] = m[0][1];
		t[2][0] = m[0][2];
		t[3][0] = m[0][3];

		t[0][1] = m[1][0];
		t[1][1] = m[1][1];
		t[2][1] = m[1][2];
		t[3][1] = m[1][3];

		t[0][2] = m[2][0];
		t[1][2] = m[2][1];
		t[2][2] = m[2][2];
		t[3][2] = m[2][3];

		t[0][3] = m[3][0];
		t[1][3] = m[3][1];
		t[2][3] = m[3][2];
		t[3][3] = m[3][3];
		return t;
	}
};

Object.keys(mat)
.filter(e => typeof mat[e] === 'function')
.forEach(e => {
	mat[e] = mat[e].bind(mat);
});

function Ctx(canvas) {
	let gl = canvas.getContext('webgl2');
	if (!gl) throw 'Unable to create WebGL2 context';

	this.gl = gl;
	this.fb = new FBO(this);
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
	zTest(enable) {
		const { gl } = this;

		if (enable) {
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clearDepth(1.0);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}
	},

	blend(enable) {
		const { gl } = this;

		if (enable) {
			gl.enable(gl.BLEND);
			gl.blendEquation(gl.FUNC_ADD);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		} else {
			gl.disable(gl.BLEND);
		}
	},

	draw(model, prg) {
		const { gl } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers([gl.BACK]);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		prg.use();
		model.draw();
	},

	clear(color = [0, 0, 0, 1], depth = true) {
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
		flush(this.prg, this.shader, this.tex, this.vao, this.buf, this.fbo, this.rbo);

		function flush(...ns) {
			ns.flatMap(e => [...e.pool.keys()]).forEach(e => e.dispose());
		}
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
		url(src) {
			return Shader.url(this, src, this.gl.VERTEX_SHADER);
		}
	}),

	fs: assign(function(src) {
		return new FS(this, src);
	}, {
		url(src) {
			return Shader.url(this, src, this.gl.FRAGMENT_SHADER);
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

function Buffer(ctx, type, usage) {
	const { gl, buf } = ctx;
	assign(this, {
		gl,	type, usage,
		id: gl.createBuffer(),
		pool: buf.pool.add(this)
	});
}

Buffer.prototype = {
	bind() {
		const { gl, id, type } = this;
		gl.bindBuffer(type, id);
	},

	storage(size) {
		const { gl, type, usage } = this;
		gl.bufferData(type, size, usage);
	},

	data(array) {
		const { gl, type, usage } = this;
		gl.bufferData(type, array, usage);
	},

	subData(array, offset) {
		const { gl, type } = this;
		gl.bufferSubData(type, offset, Float32Array.from(array));
	},

	dispose() {
		const { gl, id, type, pool } = this;
		Buffer.unbind(gl, type);
		gl.deleteBuffer(id);
		pool.delete(this);
	}
};

Buffer.unbind = (gl, type) => {
	gl.bindBuffer(type, null);
};

function VAO(ctx, indexCount, attributeCount) {
	const { gl, vao } = ctx;
	assign(this, {
		gl,	indexCount,	attributeCount,
		id: gl.createVertexArray(),
		pool: vao.pool.add(this)
	});
}

VAO.prototype = {
	bind() {
		const { gl, id } = this;
		gl.bindVertexArray(id);
	},

	dispose() {
		const { gl, id, attributeCount, pool } = this;
		this.bind();
		for (let i = 0; i < attributeCount; i++) {
			gl.disableVertexAttribArray(i);
		}
		VAO.unbind(gl);
		gl.deleteVertexArray(id);
		pool.delete(this);
	}
};

VAO.unbind = gl => {
	gl.bindVertexArray(null);
};

function FBO(ctx) {
	const { gl, fbo } = ctx;
	assign(this, {
			gl,
			id: gl.createFramebuffer(),
			attachments: new Map(),
			pool: fbo.pool.add(this)
	});

	return new Proxy(this, {
		set: function(tg, p, val) {
			const pt = Number.parseInt(p);
			if (Number.isInteger(pt)) {
				tg.attach(pt, val);
			} else {
				Reflect.set(...arguments);
			}
			return true;
		}
	});
}

FBO.prototype = {
	set depth(rbo) {
		this.attachDepth(rbo);
	},

	attach(pt, level) {
		const { gl, id } = this;
		const p = gl.COLOR_ATTACHMENT0 + pt;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
		if (level) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, p, gl.TEXTURE_2D, level.tex, level.lv);
			this.attachments.set(p, level);
		} else {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, p, gl.TEXTURE_2D, null, 0);
			this.attachments.delete(p);
		}
		FBO.unbind(gl);
	},

	attachDepth(depth) {
		const { gl, id } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
		const did = (depth ? depth.id : null);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
			gl.RENDERBUFFER, depth ? depth.id : null);
		FBO.unbind(gl);
	},

	validate() {
		const { gl } = this;
		this.bind();
		return gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	},

	bind() {
		const { gl, id } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
	},

	dispose() {
		const { gl, id, pool } = this;
		FBO.unbind(gl);
		gl.deleteFramebuffer(id);
		pool.delete(this);
	},

	draw(model, prg) {
		const { gl } = this;
		this.bind();
		gl.drawBuffers(this.attachments.keys());
		const { w, h } = this.attachments.values().next().value;
		gl.viewport(0, 0, w, h);
		prg.use();
		model.draw();
	},

	clear(color = [0, 0, 0, 1], depth = true) {
		const { gl } = this;
		this.bind();
		gl.drawBuffers(this.attachments.keys());
		gl.clearColor(...color);
		if (depth) {
			gl.depthMask(true);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		} else {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	}
};

FBO.unbind = gl => {
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

function RBO(ctx, w, h, fmt) {
	const { gl, rbo } = ctx;
	assign(this, {
		gl,
		id: gl.createRenderbuffer(),
		pool: rbo.pool.add(this)
	});

	this.bind();
	gl.renderbufferStorage(gl.RENDERBUFFER, fmt, w, h);
	RBO.unbind(gl);
};

RBO.prototype = {
	bind() {
		const { gl, id } = this;
		gl.bindRenderbuffer(gl.RENDERBUFFER, id);
	},

	dispose() {
		const { gl, id, pool} = this;
		RBO.unbind(gl);
		gl.deleteRenderbuffer(id);
		pool.delete(this);
	}
};

RBO.unbind = gl => {
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

function Shader(ctx, source, type) {
	const { gl, shader } = ctx;
	const id = gl.createShader(type);
	assign(this, {
		gl,	id,
		pool: shader.pool.add(this)
	 });

	if (type === gl.VERTEX_SHADER) {
		const a = source.match(/in\s.*;/ig);
		this.input = a && a.map(e =>
			e.replace(/in\s+\w+\s+/i, "").replace(/\s*;/, ""));
	} else if (type === gl.FRAGMENT_SHADER) {
		const a = source.match(/uniform sampler.*;/ig);
		this.samplers = a && a.map(e =>
			e.replace(/uniform sampler\w*\s+/i, "").replace(/\s*;/, ""));
	} else {
		throw src + ' is of unknown type: ' + type;
	}

	gl.shaderSource(id, source);
	gl.compileShader(id);

	if (!gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
		throw "Compilation error for shader [" + source + "]. " + gl.getShaderInfoLog(id, 1000);
	}
}

Shader.prototype.dispose = function() {
	const { gl, id, pool } = this;
	gl.deleteShader(id);
	pool.delete(this);
};

Shader.url = async (ctx, src, type) => {
	const res = await fetch(src);
	const source = await res.text();
	return new Shader(ctx, source, type);
};

function VS(ctx, src) {
	Shader.call(this, ctx, src, gl.VERTEX_SHADER);
}

VS.prototype = Object.create(Shader.prototype);

function FS(ctx, src) {
	Shader.call(this, ctx, src, gl.FRAGMENT_SHADER);
}

FS.prototype = Object.create(Shader.prototype);

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

function VBO(ctx, usage) {
	Buffer.call(this, ctx, ctx.gl.ARRAY_BUFFER, usage);
}

VBO.prototype = Object.create(Buffer.prototype);

VBO.unbind = gl => {
	Buffer.unbind(gl, gl.ARRAY_BUFFER);
};

function IBO(ctx, usage) {
	Buffer.call(this, ctx, ctx.gl.ELEMENT_ARRAY_BUFFER, usage);
}

IBO.prototype = Object.create(Buffer.prototype);

IBO.unbind = gl => {
	Buffer.unbind(gl, gl.ELEMENT_ARRAY_BUFFER);
};

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

function Model(ctx, vertices, indices, vertexLayout) {
	const { gl } = ctx;
	const x = Float32Array.from(vertices);
	const y = Uint16Array.from(indices);

	const stride = vertexLayout.reduce((sum, e) => sum + 4 * e, 0);

	assign(this, {
		gl,
		cull: true,
		back: false,
		ztest: true,
		zwrite: true,
		va: new VAO(ctx, indices.length, vertexLayout.length),
		vb: new VBO(ctx, gl.STATIC_DRAW),
		ib: new IBO(ctx, gl.STATIC_DRAW)
	});

	const { va, vb, ib } = this;

	va.bind();
	vb.bind();
	vb.data(x);
	ib.bind();
	ib.data(y);

	var offset = 0;

	for (let i = 0; i < vertexLayout.length; i++) {
		gl.vertexAttribPointer(i, vertexLayout[i], gl.FLOAT, false, stride, offset);
		gl.enableVertexAttribArray(i);
		offset += 4 * vertexLayout[i];
	}

	VAO.unbind(gl);
	VBO.unbind(gl);
	IBO.unbind(gl);
}

Model.prototype = {
	drawElements() {
		const { gl, va } = this;
		va.bind();
		gl.drawElements(gl.TRIANGLES, va.indexCount, gl.UNSIGNED_SHORT, 0);
		VAO.unbind(gl);
	},

	draw() {
		const { gl, cull, back, ztest, zwrite } = this;
		if (cull) {
			gl.enable(gl.CULL_FACE);
			gl.cullFace(back ? gl.FRONT : gl.BACK);
		} else {
			gl.disable(gl.CULL_FACE);
		}

		if (ztest) {
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}
		gl.depthMask(zwrite);
		this.drawElements();
	},

	dispose() {
		const { va, vb, ib } = this;
		va.dispose();
		vb.dispose();
		ib.dispose();
	}
};

Model.url = async (ctx, obj, computeTangentFrame, scale) => {
	const res = await fetch(obj);
	const data = await res.text();
	const p = [], n = [], p1 = [], n1 = [], t = [],
	t1 = [], f = [], m = {}, g = [];
	var k = 0, d = [];
	const { mul, sub, add, dot, nrm } = vec;

	const s = data.split(/\n/);
	for (let q of s) {
		let r = q.split(" ");
		if (r[0] == "v") {
			p.push([ parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]) ]);
		} else if (r[0] == "vt") {
			r = q.split(" ");
			t.push([ parseFloat(r[1]), parseFloat(r[2]) ]);
		} else if (r[0] == "vn") {
			r = q.split(" ");
			n.push([ parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]) ]);
		} else if (r[0] == "f") {
			for (let i = 0; i < 3; i++) {
				q = r[i + 1];
				if (!m.q) {
					m[q] = k;
					f.push(k++);
					const w = q.split(/\/+/);
					let b = parseInt(w[0]) - 1;
					p1.push(mul(p[b], scale));
					let e = 0;

					if (t.length > 0) {
						b = parseInt(w[1]) - 1;
						t1.push(t[b]);
						e = 1;
					}
					if (n.length > 0) {
						b = parseInt(w[e + 1]) - 1;
						n1.push(n[b]);
					}
				} else {
					f.push(m[q]);
				}
			}
		}
	}

	if (computeTangentFrame && (t.length > 0) && (n.length > 0)) {
		const ta = new Map();
		const ba = new Map();

		for (let i = 0; i < f.length; i += 3) {
			const u = [ f[i], f[i + 1], f[i + 2] ];

			for (let j = 0; j < 3; j++) {
				const q = (j + 1) % 3;
				const r = (j + 2) % 3;
				const c = u[j];
				const vp = p1[c];
				const vt = t1[c];
				const dp1 = sub(p1[u[q]], vp);
				const dt1 = vec2.sub(t1[u[q]], vt);
				const dp2 = sub(p1[u[r]], vp);
				const dt2 = vec2.sub(t1[u[r]], vt);

				const x = 1.0 / vec2.cross(dt1, dt2);
				const tan = mul(sub(mul(dp1, dt2[1]), mul(dp2, dt1[1])), x);
				const bit = mul(sub(mul(dp2, dt1[0]), mul(dp1, dt2[0])), x);
				ta.set(c, ta.has(c) ? ta.get(c).concat([tan]) : [tan]);
				ba.set(c, ba.has(c) ? ba.get(c).concat([bit]) : [bit]);
			}
		}

		for (let i = 0; i < p1.length; i++) {
			g.push(...p1[i]);
			g.push(...t1[i]);
			const v = n1[i];
			g.push(...v);

			const tan = ta.get(i);
			const bit = ba.get(i);
			var ts = [0, 0, 0];
			var bs = [0, 0, 0];

			for (let j = 0; j < tan.length; j++) {
				ts = add(ts, tan[j]);
				bs = add(bs, bit[j]);
			}
			ts = nrm(add(ts, mul(v, -dot(v, ts))));
			bs = nrm(add(bs, mul(v, -dot(v, bs))));

			g.push(...ts);
			g.push(...bs);
		}

		d = [3, 2, 3, 3, 3];
	} else {
		for (let i = 0; i < p1.length; i++) {
			g.push(...p1[i]);

			if (t1.length > 0) {
				g.push(...t1[i]);
			}

			if (n1.length > 0) {
				g.push(...n1[i]);
			}
		}
		if (t.length > 0) {
			if (n.length > 0) {
				d = [3, 2, 3];
			} else {
				d = [3, 2];
			}
		} else if (n.length > 0) {
			d = [3, 3];

		} else {
			d = [3];
		}
	}
	return new Model(ctx, g, f, d);
};

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

function Tex(ctx, w, h, properties) {
	const { gl, tex } = ctx;

	const id = gl.createTexture();
	const { data, fmt, srcFmt, type, mips, wrap } = properties;
	assign(this, {
		gl, id,	w, h, fmt,
		pool: tex.pool.add(this)
	});

	this.Level = function(lv) {
		assign(this, {
			w: w >> lv,
			h: h >> lv,
			fmt,
			tex: id,
			lv
		});
	};

	this.Level.prototype = {
		draw(model, prg, depthbuffer = null) {
			const { fb } = ctx;
			fb.attach(0, this);
			fb.attachDepth(depthbuffer);
			fb.draw(model, prg);
			return this;
		},

		clear(depthbuffer = null) {
			const { fb } = ctx;
			fb.attach(0, this);
			fb.attachDepth(depthbuffer);
			fb.clear();
			return this;
		}
	};

	gl.bindTexture(gl.TEXTURE_2D, id);

	if (data) {
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, srcFmt, type, data);

		if (mips) {
			this.mip();
		}
	} else if (mips) {
		const m = Tex.mips(w, h);
		gl.texStorage2D(gl.TEXTURE_2D, m, fmt, w, h);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, m - 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

	} else {
		gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
	}

	if (!mips) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	this.texwrap(wrap);

	return new Proxy(this, {
		get: function(tg, p) {
			const lod = Number.parseInt(p);
			if (Number.isInteger(lod)) {
				return new tg.Level(lod);
			} else {
				return Reflect.get(...arguments);
			}
		}
	});
}

Tex.prototype = {
	texwrap(wrap) {
		const { gl, id, pool } = this;
		const current = pool.current;
		gl.bindTexture(gl.TEXTURE_2D, id);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
		if (current) {
			gl.bindTexture(gl.TEXTURE_2D, current);
		}
	},

	mip() {
		const { gl, id, pool, w, h } = this;
		const current = pool.current;
		gl.bindTexture(gl.TEXTURE_2D, id);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, Tex.mips(w, h) - 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		if (current) {
			gl.bindTexture(gl.TEXTURE_2D, current);
		}
	},

	bind(unit) {
		const { gl, id, pool } = this;
		this.unit = unit;
		pool.current = id;
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, id);
	},

	dispose() {
		const { gl, id, pool } = this;
		this.unbind();
		gl.deleteTexture(id);
		pool.delete(this);
	},

	unbind() {
		const { gl, id, pool, unit } = this;
		if (unit) {
			gl.activeTexture(gl.TEXTURE0 + unit);
			delete this.unit;
		}
		if (pool.current === id) {
			pool.current = undefined;
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
};

Tex.url = (ctx, url, properties = {}) => {
	return new Promise(function(resolve) {
		const img = new Image();
		img.onload = function() {
			const { gl } = ctx;
 			const { fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, mips = true, wrap = gl.REPEAT } = properties;
			const tex = new Tex(ctx, this.width, this.height, { data: this, fmt, srcFmt, type, mips, wrap });
			resolve(tex);
		};
		img.src = url;
	});
};

Tex.data = (ctx, data, properties = {}) => {
	const { gl } = ctx;
	const { w, h, fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, mips = false, wrap = gl.REPEAT } = properties;
	return new Tex(ctx, data.width || w, data.height || h, { data, fmt, srcFmt, type, mips, wrap });
};

Tex.mips = (width, height) => {
	var res = Math.min(width, height);
	var n = 1;
	while (res > 1) {
		res /= 2;
		n++;
	}
	return n;
};

function Camera(pos, target, aspectRatio, zNear, zFar, fov, glSpace = true) {
	this.pos = pos;
	this.glSpace = glSpace;

	[this.view, this.proj] = glSpace ?
	[mat.glView(pos, target), mat.glProj(zNear, zFar, fov, aspectRatio)] :
	[mat.view(pos, target), mat.proj(zNear, zFar, fov, aspectRatio)];
}

Camera.prototype = {
	move(pos, target) {
		this.view = glSpace ? mat.glView(pos, target) : mat.view(pos, target);
	},

	get matrix() {
		return mat.mul(this.view, this.proj);
	}
};

export { vec, vec2, mat, Ctx, Camera };

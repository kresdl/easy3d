const { assign } = Object;

function Tex(ctx, w, h, properties) {
	const { gl, tex } = ctx;

	const id = gl.createTexture();
	const { data, fmt, srcFmt, type, mips, wrap } = properties;
	assign(this, {
		gl, id, w, h, fmt,
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
			if (this.blend) {
				gl.enable(gl.BLEND);
			} else {
				gl.disable(gl.BLEND);
			}
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

	const t2d = gl.TEXTURE_2D;
	gl.bindTexture(t2d, id);

	if (data) {
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(t2d, 0, fmt, w, h, 0, srcFmt, type, data);

		if (mips) {
			this.maxLevel = (typeof mips === 'number'? mips : calcLOD(w, h)) - 1;
			this.mip();
		}
	} else if (mips) {
		const maxLevel = (typeof mips === 'number'? mips : calcLOD(w, h)) - 1;
		this.maxLevel = maxLevel;
		gl.texStorage2D(t2d, maxLevel + 1, fmt, w, h);
		gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, maxLevel);
		gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	} else {
		gl.texStorage2D(t2d, 1, fmt, w, h);
	}

	if (!mips) {
		this.maxLevel = 0;
		gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, 0);
		gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	gl.texParameteri(t2d, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(t2d, gl.TEXTURE_WRAP_S, wrap);
	gl.texParameteri(t2d, gl.TEXTURE_WRAP_T, wrap);

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
	mip() {
		const { gl, id, pool: { current }, maxLevel } = this;
		const t2d = gl.TEXTURE_2D;
		gl.bindTexture(t2d, id);
		gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, maxLevel);
		gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(t2d);
		if (current) {
			gl.bindTexture(t2d, current);
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
			delete pool.current;
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

function calcLOD(width, height) {
	var res = Math.min(width, height);
	var n = 1;
	while (res > 1) {
		res /= 2;
		n++;
	}
	return n;
}

export default Tex;

import Asset from './Asset';

const { assign } = Object,
{ isFinite } = Number;

export default class Tex extends Asset {
	static Level = class {
		constructor(tex, fb, lod) {
			const { w, h } = tex;
			assign(this, {
				lod, tex, fb,
				w: w >> lod,
				h: h >> lod,
			})
		}

		draw = (model, prg, depthbuffer, blend) => {
			const { fb } = this;
			fb[0] = this;
			fb.depth = depthbuffer;
			fb.draw(model, prg, blend);
			return this;
		}

		clear = (clearColor, depthbuffer, clearDepth) => {
			const { fb } = this;
			fb[0] = this;
			fb.depth = depthbuffer;
			fb.clear(clearColor, clearDepth);
			return this;
		}
	}

	constructor(gl, w, h, properties, fb) {
		super();
		const id = gl.createTexture(),
		{ data, fmt, srcFmt, type, levels, wrap } = properties;

		Asset.pool.get(gl).add(this);

		assign(this, {
			gl, id, w, h, fmt
		});

		const t2d = gl.TEXTURE_2D;
		gl.bindTexture(t2d, id);

		if (data) {
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(t2d, 0, fmt, w, h, 0, srcFmt, type, data);

			if (levels) {
				this.maxLevel = (isFinite(levels) ? levels : calcLOD(w, h)) - 1;
				this.mip();
			}
		} else if (levels) {
			const maxLevel = (isFinite(levels) ? levels : calcLOD(w, h)) - 1;
			this.maxLevel = maxLevel;
			gl.texStorage2D(t2d, maxLevel + 1, fmt, w, h);
			gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, maxLevel);
			gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		} else {
			gl.texStorage2D(t2d, 1, fmt, w, h);
		}

		if (!levels) {
			this.maxLevel = 0;
			gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, 0);
			gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		gl.texParameteri(t2d, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(t2d, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(t2d, gl.TEXTURE_WRAP_T, wrap);

		return new Proxy(this, {
			get: function(tg, p) {
				if (typeof p === 'string') {
					const lod = Number(p);
					if (Number.isInteger(lod)) {
						return new Tex.Level(tg, fb, lod);
					}
				}
				return Reflect.get(...arguments);
			}
		});
	}

	mip = () => {
		const { gl, id, maxLevel } = this;
		const t2d = gl.TEXTURE_2D;
		gl.bindTexture(t2d, id);
		gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, maxLevel);
		gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(t2d);
		if (Tex.current) {
			gl.bindTexture(t2d, Tex.current);
		}
		return this;
	}

	bind = unit => {
		const { gl, id } = this;
		this.unit = unit;
		Tex.current = id;
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, id);
	}

	dispose = () => {
		const { gl, id } = this;
		this.unbind();
		gl.deleteTexture(id);
		Asset.pool.get(gl).delete(this);
	}

	drop = () => {
		this.disposeAfterUse = true;
		return this;
	}

	unbind = () => {
		const { gl, id, unit } = this;
		if (unit) {
			gl.activeTexture(gl.TEXTURE0 + unit);
			delete this.unit;
		}
		if (Tex.current === id) {
			delete Tex.current;
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	static url = (gl, url, properties = {}, fb, signal) => {
		return new Promise(function(resolve, reject) {
			const img = new Image();
			img.onload = function() {
				if (signal && signal.aborted) {
					return reject('Texture load aborted');
				}
	 			const { fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, levels = true, wrap = gl.REPEAT } = properties,
				tex = new Tex(gl, this.width, this.height, { data: this, fmt, srcFmt, type, levels, wrap }, fb);
				resolve(tex);
			};
			img.crossOrigin = "Anonymous";
			img.src = url;
		});
	}

	static data = (gl, data, properties = {}, fb) => {
		const { width, height, fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, levels = false, wrap = gl.REPEAT } = properties;
		return new Tex(gl, data.width || width, data.height || height, { data, fmt, srcFmt, type, levels, wrap }, fb);
	}
}

function calcLOD(width, height) {
	var res = Math.min(width, height),
	n = 1;
	while (res > 1) {
		res /= 2;
		n++;
	}
	return n;
}

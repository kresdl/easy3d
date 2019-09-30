import Asset from './Asset';
import setBlendState from '../setBlendState.js';

const { assign } = Object,
{ isFinite, isInteger } = Number,
{ isArray } = Array;

export default class FBO extends Asset{
	attachments = new Map()

	constructor(gl) {
		super();
		assign(this, {
			gl,
			id: gl.createFramebuffer()
		});

		Asset.pool.get(gl).add(this);

		return new Proxy(this, {
			set: function(fb, p, val) {
				const pt = Number(p);
				if (isInteger(pt)) {
					fb.attach(pt, val);
				} else if (p === 'depth') {
					fb.attach(val);
				} else if (p === 'target') {
					const { tg, z } = val;
					fb.detachAll();
					if (isArray(tg)) {
						tg.forEach((t, i) => {
							fb.attach(i, t);
						});
					} else {
						fb.attach(0, tg);
					}
					fb.attach(z);
				} else {
					Reflect.set(...arguments);
				}
				return true;
			}
		});
	}

	attach = (pt, level) => {
		const { gl, attachments, bind } = this;
		bind();
		if (isFinite(pt)) {
			const p = gl.COLOR_ATTACHMENT0 + pt;
			if (level) {
				attachments.set(pt, level);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, p, gl.TEXTURE_2D, level.tex.id, level.lod);
			} else {
				attachments.delete(p);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, p, gl.TEXTURE_2D, null, 0);
			}
		} else {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, pt && pt.id);
		}
	}

	detachAll = () => {
		const { gl, attachments, bind } = this;
		bind();
		[...attachments.keys()].forEach(pt => {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, pt + gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
		});
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, null);
		attachments.clear();
	}

	validate = () => {
		const { gl, bind } = this;
		bind();
		return gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	}

	bind = () => {
		const { gl, id } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
	}

	dispose = () => {
		const { gl, id } = this;
		FBO.unbind(gl);
		gl.deleteFramebuffer(id);
		Asset.pool.get(gl).delete(this);
	}

	draw = (model, prg, blend = false) => {
		const { gl, id, attachments } = this,
		drawBuffers = [...attachments.keys()].map(e => e + gl.COLOR_ATTACHMENT0),
		{ w, h } = attachments.values().next().value;
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
		gl.drawBuffers(drawBuffers);
		setBlendState(gl, blend === true ? 'over' : blend);
		gl.viewport(0, 0, w, h);
		prg.use();
		model.draw();
	}

	clear = (colors = true, depth = true) => {
		const { gl, bind, attachments } = this,
		pts = [...attachments.keys()];
		colors = colors === true ? [0, 0, 0, 0] : colors;
		depth = depth === true ? 1.0 : depth;
		bind();
		gl.drawBuffers(pts.map(e => e + gl.COLOR_ATTACHMENT0));
		if (colors) {
			pts.forEach((pt, i) => {
				gl.clearBufferfv(gl.COLOR, pt, isFinite(colors[0]) ? colors : colors[i]);
			});
		}
		if (depth) {
			gl.depthMask(true);
			gl.clearBufferfi(gl.DEPTH_STENCIL, 0, depth, 0);
		}
		return this;
	}

	static unbind = gl => {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
}
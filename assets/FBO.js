const { assign } = Object;

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

export default FBO;

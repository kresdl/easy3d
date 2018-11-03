const { assign } = Object;

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

export default RBO;

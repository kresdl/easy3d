const { assign } = Object;

export default class RBO {
	constructor(gl, w, h, fmt) {
		assign(this, {
			gl,
			id: gl.createRenderbuffer()
		});

		this.bind();
		gl.renderbufferStorage(gl.RENDERBUFFER, fmt, w, h);
		RBO.unbind(gl);
	}

	bind = () => {
		const { gl, id } = this;
		gl.bindRenderbuffer(gl.RENDERBUFFER, id);
	}

	dispose = () => {
		const { gl, id } = this;
		RBO.unbind(gl);
		gl.deleteRenderbuffer(id);
	}

	discard = () => {
		this.disposeAfterUse = true;
		return this;
	}

	static unbind = gl => {
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}
}
import Asset from './Asset';
const { assign } = Object;

export default class RBO extends Asset {
	constructor(gl, w, h, fmt) {
		super();
		assign(this, {
			gl,
			id: gl.createRenderbuffer()
		});

		Asset.pool.get(gl).add(this);

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
		Asset.pool.get(gl).delete(this);
	}

	discard = () => {
		this.disposeAfterUse = true;
		return this;
	}

	static unbind = gl => {
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}
}
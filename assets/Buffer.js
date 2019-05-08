const { assign } = Object;

export default class {
	static unbind = (gl, type) => {
		gl.bindBuffer(type, null);
	}

	constructor(gl, type, usage) {
		assign(this, {
			gl,	type, usage,
			id: gl.createBuffer()
		});
	}

	bind = () => {
		const { gl, id, type } = this;
		gl.bindBuffer(type, id);
	}

	storage = size => {
		const { gl, type, usage } = this;
		gl.bufferData(type, size, usage);
	}

	data = array => {
		const { gl, type, usage } = this;
		gl.bufferData(type, array, usage);
	}

	subData = (array, offset) => {
		const { gl, type } = this;
		gl.bufferSubData(type, offset, Float32Array.from(array));
	}

	dispose = () => {
		const { gl, id, type, pool } = this;
		Buffer.unbind(gl, type);
		gl.deleteBuffer(id);
	}
}
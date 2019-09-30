import Asset from './Asset';
const { assign } = Object;

export default class Buffer extends Asset {
	static unbind = (gl, type) => {
		gl.bindBuffer(type, null);
	}

	constructor(gl, type, usage) {
		super();
		assign(this, {
			gl,	type, usage,
			id: gl.createBuffer()
		});
		Asset.pool.get(gl).add(this);
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
		Asset.pool.get(gl).delete(this);
	}
}
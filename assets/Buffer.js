const { assign } = Object;

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

export default Buffer;

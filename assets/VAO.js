const { assign } = Object;

function VAO(ctx, indexCount, attributeCount) {
	const { gl, vao } = ctx;
	assign(this, {
		gl,	indexCount,	attributeCount,
		id: gl.createVertexArray(),
		pool: vao.pool.add(this)
	});
}

VAO.prototype = {
	bind() {
		const { gl, id } = this;
		gl.bindVertexArray(id);
	},

	dispose() {
		const { gl, id, attributeCount, pool } = this;
		this.bind();
		for (let i = 0; i < attributeCount; i++) {
			gl.disableVertexAttribArray(i);
		}
		VAO.unbind(gl);
		gl.deleteVertexArray(id);
		pool.delete(this);
	}
};

VAO.unbind = gl => {
	gl.bindVertexArray(null);
};

export default VAO;

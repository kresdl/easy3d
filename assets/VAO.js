const { assign } = Object;

export default class {
	constructor(gl, indexCount, attributeCount) {
		assign(this, {
			gl,	indexCount,	attributeCount,
			id: gl.createVertexArray()
		});
	}

	bind = () => {
		const { gl, id } = this;
		gl.bindVertexArray(id);
	}

	dispose = () => {
		const { gl, id, attributeCount } = this;
		this.bind();
		for (let i = 0; i < attributeCount; i++) {
			gl.disableVertexAttribArray(i);
		}
		VAO.unbind(gl);
		gl.deleteVertexArray(id);
	}

	static unbind = gl => {
		gl.bindVertexArray(null);
	}
}
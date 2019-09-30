import Asset from './Asset';
const { assign } = Object;

export default class VAO extends Asset {
	constructor(gl, indexCount, attributeCount) {
		super();
		assign(this, {
			gl,	indexCount,	attributeCount,
			id: gl.createVertexArray()
		});

		Asset.pool.get(gl).add(this);
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
		Asset.pool.get(gl).delete(this);
	}

	static unbind = gl => {
		gl.bindVertexArray(null);
	}
}
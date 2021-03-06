import Buffer from './Buffer.js';

export default class VBO extends Buffer {
	constructor(gl, usage) {
		super(gl, gl.ARRAY_BUFFER, usage);
	}

	static unbind = gl => {
		Buffer.unbind(gl, gl.ARRAY_BUFFER);
	}
}
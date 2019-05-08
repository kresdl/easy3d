import Buffer from './Buffer.js';

export default class extends Buffer {
	static unbind = gl => {
		Buffer.unbind(gl, gl.ELEMENT_ARRAY_BUFFER);
	}

	constructor(gl, usage) {
		super(gl, gl.ELEMENT_ARRAY_BUFFER, usage);
	}
}
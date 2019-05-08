import Shader from './Shader.js';

export default class FS extends Shader {
	constructor(gl, src, constants) {
		super(gl, src, gl.FRAGMENT_SHADER, constants);
	}

	static url = async (gl, src, constants) => {
		const res = await fetch(src),
		source = await res.text();
		return new FS(gl, source, constants);
	}
}
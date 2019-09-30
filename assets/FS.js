import Shader from './Shader.js';

export default class FS extends Shader {
	constructor(gl, src, constants) {
		super(gl, src, gl.FRAGMENT_SHADER, constants);
	}

	static url = async (gl, src, constants, signal) => {
		const source = await Shader.fetchSource(src, signal);
		return new FS(gl, source, constants);
	}
}
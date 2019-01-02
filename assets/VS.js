import Shader from './Shader.js';

function VS(ctx, src, constants) {
	Shader.call(this, ctx, src, gl.VERTEX_SHADER, constants);
}

VS.prototype = Object.create(Shader.prototype);

export default VS;

import Shader from './Shader.js';

function VS(ctx, src) {
	Shader.call(this, ctx, src, gl.VERTEX_SHADER);
}

VS.prototype = Object.create(Shader.prototype);

export default VS;

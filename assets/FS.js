import Shader from './Shader.js';

function FS(ctx, src) {
	Shader.call(this, ctx, src, gl.FRAGMENT_SHADER);
}

FS.prototype = Object.create(Shader.prototype);

export default FS;

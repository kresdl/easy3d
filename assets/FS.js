import Shader from './Shader.js';

function FS(ctx, src, constants) {
	Shader.call(this, ctx, src, gl.FRAGMENT_SHADER, constants);
}

FS.prototype = Object.create(Shader.prototype);

export default FS;

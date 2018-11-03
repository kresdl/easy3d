import Buffer from './Buffer.js';

function VBO(ctx, usage) {
	Buffer.call(this, ctx, ctx.gl.ARRAY_BUFFER, usage);
}

VBO.prototype = Object.create(Buffer.prototype);

VBO.unbind = gl => {
	Buffer.unbind(gl, gl.ARRAY_BUFFER);
};

export default VBO;

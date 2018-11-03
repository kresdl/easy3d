import Buffer from './Buffer.js';

function IBO(ctx, usage) {
	Buffer.call(this, ctx, ctx.gl.ELEMENT_ARRAY_BUFFER, usage);
}

IBO.prototype = Object.create(Buffer.prototype);

IBO.unbind = gl => {
	Buffer.unbind(gl, gl.ELEMENT_ARRAY_BUFFER);
};

export default IBO;

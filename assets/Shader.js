const { assign } = Object;

function Shader(ctx, source, type) {
	const { gl, shader } = ctx;
	const id = gl.createShader(type);
	assign(this, {
		gl, id,
		pool: shader.pool.add(this)
	 });

	if (type === gl.VERTEX_SHADER) {
		const a = source.match(/in\s.*;/ig);
		this.input = a && a.map(e =>
			e.replace(/in\s+\w+\s+/i, "").replace(/\s*;/, ""));
	} else if (type === gl.FRAGMENT_SHADER) {
		const a = source.match(/uniform sampler.*;/ig);
		this.samplers = a && a.map(e =>
			e.replace(/uniform sampler\w*\s+/i, "").replace(/\s*;/, ""));
	} else {
		throw src + ' is of unknown type: ' + type;
	}

	gl.shaderSource(id, source);
	gl.compileShader(id);

	if (!gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
		throw "Compilation error for shader [" + source + "]. " + gl.getShaderInfoLog(id, 1000);
	}
}

Shader.prototype.dispose = function() {
	const { gl, id, pool } = this;
	gl.deleteShader(id);
	pool.delete(this);
};

Shader.url = async (ctx, src, type, constants) => {
	const res = await fetch(src);
	var source = await res.text();
	if (constants) {
		Object.keys(constants).forEach(c => {
			source = source.replace(new RegExp(`\\$${c}`, 'g'), ('' + constants[c]));
		});
	}
	return new Shader(ctx, source, type);
};

export default Shader;

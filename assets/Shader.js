const { assign } = Object;

function Shader(ctx, source, type, constants) {
	const { gl, shader } = ctx;
	const id = gl.createShader(type);
	assign(this, {
		gl, id,
		pool: shader.pool.add(this)
	 });

	if (constants) {
		Object.keys(constants).forEach(c => {
			const r = new RegExp(`\\$${c}(\.f)?`, 'g');
			let a;
			while ((a = r.exec(source)) !== null) {
				const txt = '' + constants[c];
				source = source.replace(a[0], a[1] ? txt.replace(/^(\d+)$/, '$1.0') : txt);
			}
		});
	}

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
	return new Shader(ctx, source, type, constants);
};

export default Shader;

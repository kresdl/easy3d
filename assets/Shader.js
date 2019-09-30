import Asset from './Asset';
const { assign, keys } = Object;

export default class Shader extends Asset {
	constructor(gl, source, type, constants) {
		super();
		const id = gl.createShader(type);
		assign(this, {
			gl, id
		});

		Asset.pool.get(gl).add(this);

		if (constants) {
			keys(constants).forEach(c => {
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
				e.match(/in\s+\w+\s+(\w+)/i)[1])
		} else if (type === gl.FRAGMENT_SHADER) {
			const a = source.match(/uniform sampler.*;/ig);
			this.samplers = a && a.map(e =>
				e.match(/uniform sampler\w*\s+(\w+)/i)[1]);
		} else {
			throw src + ' is of unknown type: ' + type;
		}

		gl.shaderSource(id, source);
		gl.compileShader(id);

		if (!gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
			throw "Compilation error for shader [" + source + "]. " + gl.getShaderInfoLog(id, 1000);
		}
	}

	dispose = () => {
		const { gl, id } = this;
		gl.deleteShader(id);
		Asset.pool.get(gl).delete(this);
	}

	static fetchSource = async (url, abortSignal) => {
		const res = await fetch(url);
		if (abortSignal && abortSignal.aborted) {
			throw 'Shader fetch aborted';
			return;
		}

		const source = await res.text();
		if (abortSignal && abortSignal.aborted) {
			throw 'Shader resolve aborted';
			return;
		}

		return source;
	}
}

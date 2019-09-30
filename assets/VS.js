import Shader from './Shader.js';

export default class VS extends Shader {
	constructor(gl, src, constants) {
		super(gl, src, gl.VERTEX_SHADER, constants);
	}

	static url = async (gl, src, constants, signal) => {
		const source = await Shader.fetchSource(src, signal);
		return new VS(gl, source, constants);
	}

	static quad = gl =>
		new VS(gl,
`#version 300 es
in vec3 pos;
in vec2 tex;

layout(std140) uniform vsArea {
	mat4 area;
};

out vec2 f_tex;

void main() {
	f_tex = tex;
	vec3 p = vec3(area * vec4(pos, 1.0)).xyz;
	gl_Position = vec4(p, 1.0);
}`)
}
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Shader from './Shader.js';
export default class VS extends Shader {
  constructor(gl, src, constants) {
    super(gl, src, gl.VERTEX_SHADER, constants);
  }

}

_defineProperty(VS, "url", async (gl, src, constants) => {
  const res = await fetch(src),
        source = await res.text();
  return new VS(gl, source, constants);
});

_defineProperty(VS, "quad", gl => new VS(gl, `#version 300 es
in vec3 pos;
in vec2 tex;

out vec2 f_tex;

void main() {
	f_tex = tex;
	gl_Position = vec4(pos, 1.0);
}`));
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Shader from './Shader.js';
export default class FS extends Shader {
  constructor(gl, src, constants) {
    super(gl, src, gl.FRAGMENT_SHADER, constants);
  }

}

_defineProperty(FS, "url", async (gl, src, constants) => {
  const res = await fetch(src),
        source = await res.text();
  return new FS(gl, source, constants);
});
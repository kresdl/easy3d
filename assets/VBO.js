function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Buffer from './Buffer.js';
export default class _class extends Buffer {
  constructor(gl, usage) {
    super(gl, gl.ARRAY_BUFFER, usage);
  }

}

_defineProperty(_class, "unbind", gl => {
  Buffer.unbind(gl, gl.ARRAY_BUFFER);
});
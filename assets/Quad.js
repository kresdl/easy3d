function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Mesh from './Mesh.js';
const {
  assign
} = Object;
export default class extends Mesh {
  constructor(_gl) {
    super(_gl, [-1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0], [1, 0, 3, 2, 3, 0], [3, 2]);

    _defineProperty(this, "draw", () => {
      const {
        gl
      } = this;
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      this.drawElements();
    });
  }

}
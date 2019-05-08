function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import setBlendState from '../setBlendState.js';
const {
  assign
} = Object,
      {
  isFinite
} = Number;
export default class {
  constructor(canvas) {
    _defineProperty(this, "draw", (model, prg, blend = false) => {
      const {
        gl,
        id
      } = this;
      gl.bindFramebuffer(gl.FRAMEBUFFER, id);
      gl.drawBuffers([gl.BACK]);
      setBlendState(gl, blend === true ? 'over' : blend);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      prg.use();
      model.draw();
      return this;
    });

    _defineProperty(this, "clear", (color = true, depth = true) => {
      const {
        gl
      } = this;
      color = color === true ? [0, 0, 0, 1] : color;
      depth = depth === true ? 1.0 : depth;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.drawBuffers([gl.BACK]);
      var clearBit = 0;

      if (color) {
        gl.clearColor(...color);
        clearBit = gl.COLOR_BUFFER_BIT;
      }

      if (depth) {
        gl.depthMask(true);
        gl.clearDepth(depth);
        clearBit = clearBit | gl.DEPTH_BUFFER_BIT;
      }

      gl.clear(clearBit);
      return this;
    });

    _defineProperty(this, "ext", name => {
      this.gl.getExtension(name);
    });

    let _gl = canvas.getContext('webgl2');

    if (!_gl) throw 'Unable to create WebGL2 context';
    this.gl = _gl;

    _gl.depthFunc(_gl.LEQUAL);

    _gl.frontFace(_gl.CCW);
  }

}
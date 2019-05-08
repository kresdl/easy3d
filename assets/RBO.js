function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  assign
} = Object;
export default class RBO {
  constructor(_gl, w, h, fmt) {
    _defineProperty(this, "bind", () => {
      const {
        gl,
        id
      } = this;
      gl.bindRenderbuffer(gl.RENDERBUFFER, id);
    });

    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id
      } = this;
      RBO.unbind(gl);
      gl.deleteRenderbuffer(id);
    });

    _defineProperty(this, "discard", () => {
      this.disposeAfterUse = true;
      return this;
    });

    assign(this, {
      gl: _gl,
      id: _gl.createRenderbuffer()
    });
    this.bind();

    _gl.renderbufferStorage(_gl.RENDERBUFFER, fmt, w, h);

    RBO.unbind(_gl);
  }

}

_defineProperty(RBO, "unbind", gl => {
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
});
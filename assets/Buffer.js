function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  assign
} = Object;
export default class _class {
  constructor(_gl, _type, _usage) {
    _defineProperty(this, "bind", () => {
      const {
        gl,
        id,
        type
      } = this;
      gl.bindBuffer(type, id);
    });

    _defineProperty(this, "storage", size => {
      const {
        gl,
        type,
        usage
      } = this;
      gl.bufferData(type, size, usage);
    });

    _defineProperty(this, "data", array => {
      const {
        gl,
        type,
        usage
      } = this;
      gl.bufferData(type, array, usage);
    });

    _defineProperty(this, "subData", (array, offset) => {
      const {
        gl,
        type
      } = this;
      gl.bufferSubData(type, offset, Float32Array.from(array));
    });

    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id,
        type,
        pool
      } = this;
      Buffer.unbind(gl, type);
      gl.deleteBuffer(id);
    });

    assign(this, {
      gl: _gl,
      type: _type,
      usage: _usage,
      id: _gl.createBuffer()
    });
  }

}

_defineProperty(_class, "unbind", (gl, type) => {
  gl.bindBuffer(type, null);
});
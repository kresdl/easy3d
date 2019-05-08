function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  assign
} = Object;
export default class _class {
  constructor(_gl, indexCount, _attributeCount) {
    _defineProperty(this, "bind", () => {
      const {
        gl,
        id
      } = this;
      gl.bindVertexArray(id);
    });

    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id,
        attributeCount
      } = this;
      this.bind();

      for (let i = 0; i < attributeCount; i++) {
        gl.disableVertexAttribArray(i);
      }

      VAO.unbind(gl);
      gl.deleteVertexArray(id);
    });

    assign(this, {
      gl: _gl,
      indexCount,
      attributeCount: _attributeCount,
      id: _gl.createVertexArray()
    });
  }

}

_defineProperty(_class, "unbind", gl => {
  gl.bindVertexArray(null);
});
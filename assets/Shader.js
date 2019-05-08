function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  assign,
  keys
} = Object;
export default class Shader {
  constructor(_gl, source, type, constants) {
    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id
      } = this;
      gl.deleteShader(id);
    });

    const _id = _gl.createShader(type);

    assign(this, {
      gl: _gl,
      id: _id
    });

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

    if (type === _gl.VERTEX_SHADER) {
      const a = source.match(/in\s.*;/ig);
      this.input = a && a.map(e => e.match(/in\s+\w+\s+(\w+)/i)[1]);
    } else if (type === _gl.FRAGMENT_SHADER) {
      const a = source.match(/uniform sampler.*;/ig);
      this.samplers = a && a.map(e => e.match(/uniform sampler\w*\s+(\w+)/i)[1]);
    } else {
      throw src + ' is of unknown type: ' + type;
    }

    _gl.shaderSource(_id, source);

    _gl.compileShader(_id);

    if (!_gl.getShaderParameter(_id, _gl.COMPILE_STATUS)) {
      throw "Compilation error for shader [" + source + "]. " + _gl.getShaderInfoLog(_id, 1000);
    }
  }

}

_defineProperty(Shader, "url", async (ctx, src, type, constants) => {
  const res = await fetch(src);
  var source = await res.text();
  return new Shader(ctx, source, type, constants);
});
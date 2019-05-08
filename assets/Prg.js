function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import VS from './VS.js';
import FS from './FS.js';
const {
  assign
} = Object;
export default class Prg {
  constructor(_gl, vs, fs, _map, _ub) {
    _defineProperty(this, "setTexture", (sampler, texture) => {
      const i = this.samplers.indexOf(sampler);

      if (i !== -1) {
        texture.bind(i);
      } else {
        throw `No such sampler as ${sampler} in program ${this}`;
      }
    });

    _defineProperty(this, "getBlockSize", block => {
      const {
        gl,
        id,
        blocks
      } = this;
      return gl.getActiveUniformBlockParameter(id, blocks[block], gl.UNIFORM_BLOCK_DATA_SIZE);
    });

    _defineProperty(this, "getUniformOffsetMap", block => {
      const {
        gl,
        id,
        blocks
      } = this,
            blockIndex = blocks[block],
            numUniforms = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS),
            indices = gl.getActiveUniformBlockParameter(id, blockIndex, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
            offsets = gl.getActiveUniforms(id, indices, gl.UNIFORM_OFFSET),
            map = {};

      for (let i = 0; i < numUniforms; i++) {
        const n = gl.getActiveUniform(id, indices[i]).name.replace("[0]", "");
        map[n] = offsets[i];
      }

      return map;
    });

    _defineProperty(this, "use", () => {
      const {
        gl,
        id
      } = this;
      gl.useProgram(id);
    });

    _defineProperty(this, "attach", shader => {
      const {
        gl,
        id
      } = this;
      gl.attachShader(id, shader.id);
    });

    _defineProperty(this, "detach", shader => {
      const {
        gl,
        id
      } = this;
      gl.detachShader(id, shader.id);
    });

    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id,
        vs,
        fs,
        detach,
        map,
        ub
      } = this;
      Prg.unuse(gl);
      gl.deleteProgram(id);
      Object.keys(this.blocks).forEach(name => {
        if (map[name].length === 1) {
          delete map[name];
        } else {
          map[name] = map[name].filter(e => e !== this);
        }
      });
      ub.configure();
    });

    _defineProperty(this, "drop", () => {
      this.disposeAfterUse = true;
      return this;
    });

    const {
      attach,
      detach,
      use
    } = this,
          _id = _gl.createProgram();

    assign(this, {
      gl: _gl,
      id: _id,
      map: _map,
      ub: _ub,
      samplers: fs.samplers
    });
    attach(vs);
    attach(fs);
    vs.input.forEach((e, i) => {
      _gl.bindAttribLocation(_id, i, e);
    });

    _gl.linkProgram(_id);

    detach(vs);
    detach(fs);

    if (!_gl.getProgramParameter(_id, _gl.LINK_STATUS)) {
      throw "Failed to link shader. " + _gl.getProgramInfoLog(_id, 1000);
    } // Get uniform blocks


    var blockCount = _gl.getProgramParameter(_id, _gl.ACTIVE_UNIFORM_BLOCKS);

    if (blockCount) {
      this.blocks = {};
    }

    for (let i = 0; i < blockCount; i++) {
      const name = _gl.getActiveUniformBlockName(_id, i);

      this.blocks[name] = i;

      if (!_map[name]) {
        _map[name] = [this];
      } else {
        _map[name].push(this);
      }
    } // Initialize samplers


    const {
      samplers
    } = this;
    use();

    if (samplers) {
      for (let i = 0; i < samplers.length; i++) {
        const n = samplers[i];

        _gl.uniform1i(_gl.getUniformLocation(_id, n), i);
      }
    }

    Prg.unuse(_gl);

    _gl.validateProgram(_id);

    if (!_gl.getProgramParameter(_id, _gl.VALIDATE_STATUS)) {
      throw "Failed to validate shader. " + _gl.getProgramInfoLog(_id, 1000);
    }

    _ub.configure();
  }

  get tex() {
    return new Proxy({}, {
      set: (tg, prop, val) => {
        this.setTexture(prop, val);
        return true;
      }
    });
  }

  set tex(t) {
    t.entries().forEach(([prop, val]) => {
      this.setTexture(prop, val);
    });
  }

}

_defineProperty(Prg, "unuse", gl => {
  gl.useProgram(null);
});

_defineProperty(Prg, "paste", (ctx, vs, map, ub) => new Prg(ctx, vs, new FS(ctx, `#version 300 es
precision mediump float;

uniform sampler2D col;

in vec2 f_tex;
out vec4 rgba;

void main() {
	rgba = texture(col, f_tex);
}`), map, ub));
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Buffer from './Buffer.js';
const {
  isArray
} = Array,
      {
  isFinite
} = Number,
      {
  keys,
  assign
} = Object;

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function (cb) {
    return this.reduce((array, e) => array.concat(cb(e)), []);
  };
}

export default class UBO extends Buffer {
  constructor(_gl, usage, _map) {
    super(_gl, _gl.UNIFORM_BUFFER, usage);

    _defineProperty(this, "blockOffsets", {});

    _defineProperty(this, "uniformOffsets", {});

    _defineProperty(this, "configure", () => {
      const {
        gl,
        map,
        alignment
      } = this;
      var t = 0,
          pt = 0;

      for (const block in map) {
        const blocksize = map[block][0].getBlockSize(block);
        t += blocksize + alignment - blocksize % alignment;
      }

      this.bind();
      this.storage(t);
      UBO.unbind(gl);
      t = 0;

      for (const block in map) {
        this[block] = {};
        this.blockOffsets[block] = t;
        const prgs = map[block],
              blocksize = prgs[0].getBlockSize(block);
        gl.bindBufferRange(gl.UNIFORM_BUFFER, pt, this.id, t, blocksize);

        for (const pg of prgs) {
          gl.uniformBlockBinding(pg.id, pg.blocks[block], pt);
        }

        pt++;
        this.uniformOffsets[block] = {};

        for (const pg of prgs) {
          const uniforms = pg.getUniformOffsetMap(block);

          for (const uni in uniforms) {
            this.uniformOffsets[block][uni] = uniforms[uni] + t;
          }
        }

        t += blocksize + alignment - blocksize % alignment;
      }
    });

    _defineProperty(this, "setUniform", (block, uniform, val) => {
      const {
        gl,
        bind,
        subData,
        has,
        uniformOffsets
      } = this,
            offset = uniformOffsets[block][uniform];
      if (!has(block, uniform)) throw `No such shader uniform as ${uniform} in block ${block}`;

      if (isArray(val) && isArray(val[0])) {
        val = val.flatMap(e => e);
      } else if (isFinite(val)) {
        val = [val];
      } else if (!isArray(val)) {
        throw 'Type not allowed as uniform buffer data: ' + typeof val;
      }

      bind();
      subData(val, offset);
      UBO.unbind(gl);
    });

    _defineProperty(this, "has", (block, uniform) => {
      const offsets = this.uniformOffsets[block];
      return offsets && (!uniform || typeof offsets[uniform] !== 'undefined');
    });

    assign(this, {
      gl: _gl,
      map: _map,
      alignment: _gl.getParameter(_gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)
    });
  }

}

_defineProperty(UBO, "unbind", gl => {
  Buffer.unbind(gl, gl.UNIFORM_BUFFER);
});
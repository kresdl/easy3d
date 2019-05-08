var _temp;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  assign
} = Object,
      {
  isFinite
} = Number;
export default class Tex {
  constructor(_gl, w, h, properties, fb) {
    _defineProperty(this, "mip", () => {
      const {
        gl,
        id,
        maxLevel
      } = this;
      const t2d = gl.TEXTURE_2D;
      gl.bindTexture(t2d, id);
      gl.texParameteri(t2d, gl.TEXTURE_MAX_LEVEL, maxLevel);
      gl.texParameteri(t2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(t2d);

      if (Tex.current) {
        gl.bindTexture(t2d, Tex.current);
      }

      return this;
    });

    _defineProperty(this, "bind", unit => {
      const {
        gl,
        id
      } = this;
      this.unit = unit;
      Tex.current = id;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, id);
    });

    _defineProperty(this, "dispose", () => {
      const {
        gl,
        id
      } = this;
      this.unbind();
      gl.deleteTexture(id);
    });

    _defineProperty(this, "drop", () => {
      this.disposeAfterUse = true;
      return this;
    });

    _defineProperty(this, "unbind", () => {
      const {
        gl,
        id,
        unit
      } = this;

      if (unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        delete this.unit;
      }

      if (Tex.current === id) {
        delete Tex.current;
      }

      gl.bindTexture(gl.TEXTURE_2D, null);
    });

    const _id = _gl.createTexture(),
          {
      data,
      fmt,
      srcFmt,
      type,
      mips,
      wrap
    } = properties;

    assign(this, {
      gl: _gl,
      id: _id,
      w,
      h,
      fmt
    });
    const _t2d = _gl.TEXTURE_2D;

    _gl.bindTexture(_t2d, _id);

    if (data) {
      _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, 1);

      _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);

      _gl.texImage2D(_t2d, 0, fmt, w, h, 0, srcFmt, type, data);

      if (mips) {
        this.maxLevel = (isFinite(mips) ? mips : calcLOD(w, h)) - 1;
        this.mip();
      }
    } else if (mips) {
      const maxLevel = (isFinite(mips) ? mips : calcLOD(w, h)) - 1;
      this.maxLevel = maxLevel;

      _gl.texStorage2D(_t2d, maxLevel + 1, fmt, w, h);

      _gl.texParameteri(_t2d, _gl.TEXTURE_MAX_LEVEL, maxLevel);

      _gl.texParameteri(_t2d, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR);
    } else {
      _gl.texStorage2D(_t2d, 1, fmt, w, h);
    }

    if (!mips) {
      this.maxLevel = 0;

      _gl.texParameteri(_t2d, _gl.TEXTURE_MAX_LEVEL, 0);

      _gl.texParameteri(_t2d, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
    }

    _gl.texParameteri(_t2d, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);

    _gl.texParameteri(_t2d, _gl.TEXTURE_WRAP_S, wrap);

    _gl.texParameteri(_t2d, _gl.TEXTURE_WRAP_T, wrap);

    return new Proxy(this, {
      get: function (tg, p) {
        if (typeof p === 'string') {
          const lod = Number(p);

          if (Number.isInteger(lod)) {
            return new Tex.Level(tg, fb, lod);
          }
        }

        return Reflect.get(...arguments);
      }
    });
  }

}

_defineProperty(Tex, "Level", (_temp = class {
  constructor(tex, _fb, lod) {
    _defineProperty(this, "draw", (model, prg, depthbuffer, blend) => {
      const {
        fb
      } = this;
      fb[0] = this;
      fb.depth = depthbuffer;
      fb.draw(model, prg, blend);
      return this;
    });

    _defineProperty(this, "clear", (clearColor, depthbuffer, clearDepth) => {
      const {
        fb
      } = this;
      fb[0] = this;
      fb.depth = depthbuffer;
      fb.clear(clearColor, clearDepth);
      return this;
    });

    const {
      w,
      h
    } = tex;
    assign(this, {
      lod,
      tex,
      fb: _fb,
      w: w >> lod,
      h: h >> lod
    });
  }

}, _temp));

_defineProperty(Tex, "url", (gl, url, properties = {}, fb) => {
  return new Promise(function (resolve) {
    const img = new Image();

    img.onload = function () {
      const {
        fmt = gl.RGBA8,
        srcFmt = gl.RGBA,
        type = gl.UNSIGNED_BYTE,
        mips = true,
        wrap = gl.REPEAT
      } = properties,
            tex = new Tex(gl, this.width, this.height, {
        data: this,
        fmt,
        srcFmt,
        type,
        mips,
        wrap
      }, fb);
      resolve(tex);
    };

    img.crossOrigin = "Anonymous";
    img.src = url;
  });
});

_defineProperty(Tex, "data", (gl, data, properties = {}, fb) => {
  const {
    w,
    h,
    fmt = gl.RGBA8,
    srcFmt = gl.RGBA,
    type = gl.UNSIGNED_BYTE,
    mips = false,
    wrap = gl.REPEAT
  } = properties;
  return new Tex(gl, data.width || w, data.height || h, {
    data,
    fmt,
    srcFmt,
    type,
    mips,
    wrap
  }, fb);
});

function calcLOD(width, height) {
  var res = Math.min(width, height),
      n = 1;

  while (res > 1) {
    res /= 2;
    n++;
  }

  return n;
}
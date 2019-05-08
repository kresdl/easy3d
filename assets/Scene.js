function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Ctx from './Ctx.js';
import FBO from './FBO.js';
import Quad from './Quad.js';
import Prg from './Prg.js';
import Buffer from './Buffer.js';
import VBO from './VBO.js';
import RBO from './RBO.js';
import IBO from './IBO.js';
import UBO from './UBO.js';
import Shader from './Shader.js';
import VS from './VS.js';
import FS from './FS.js';
import Mesh from './Mesh.js';
import Tex from './Tex.js';
const {
  defineProperty,
  assign,
  keys,
  entries,
  values,
  create
} = Object,
      {
  isArray
} = Array,
      {
  isFinite
} = Number;

function texArray(t) {
  t.mip = () => {
    t.forEach(e => {
      e.mip();
    });
    return t;
  };

  t.drop = () => {
    t.disposeAfterUse = true;
    return t;
  };

  t.dispose = () => {
    t.forEach(e => {
      e.dispose();
    });
  };

  return t;
}

export default class {
  constructor(canvas) {
    _defineProperty(this, "map", {});

    _defineProperty(this, "init", async setup => {
      const {
        assets,
        ext,
        scheme,
        statics,
        uni
      } = setup,
            {
        ctx,
        createTextures,
        createMeshes,
        createPrograms,
        createRenderbuffers,
        render
      } = this,
            {
        tex,
        mesh,
        prg,
        rbo,
        vs,
        fs
      } = assets;
      ext && (isArray(ext) ? ext.forEach(e => {
        ctx.ext(e);
      }) : ctx.ext(ext));
      this.assets = {
        tex: tex && (await createTextures(tex)),
        mesh: mesh && (await createMeshes(mesh)),
        prg: prg && (await createPrograms(vs, fs, prg)),
        rbo: rbo && createRenderbuffers(rbo)
      };
      assign(this, {
        uni,
        scheme,
        statics
      });
    });

    _defineProperty(this, "render", arg => {
      const {
        execute
      } = this;

      if (typeof arg === 'function') {
        for (const dir of arg.call(this)) {
          execute(dir);
        }
      } else if (this.scheme) {
        for (const dir of this.scheme(arg)) {
          execute(dir);
        }
      } else {
        execute(arg);
      }
    });

    _defineProperty(this, "execute", dir => {
      const {
        prg,
        tex,
        mesh,
        tg,
        z,
        uni,
        blend,
        clear
      } = dir,
            {
        ctx,
        fb,
        assets,
        resolvePrograms,
        resolveTextures,
        resolveTargets,
        resolveMeshes,
        resolveRenderbuffers
      } = this,
            batch = {
        prg: resolvePrograms(prg),
        tex: resolveTextures(tex),
        tg: resolveTargets(tg),
        mesh: resolveMeshes(mesh),
        z: resolveRenderbuffers(z)
      };
      let target = ctx;

      if (tg) {
        fb.target = {
          tg: batch.tg,
          z: batch.z
        };
        target = fb;
      }

      if (clear) {
        if (clear !== true) {
          if (isFinite(clear[0])) {
            target.clear(clear);
          } else {
            target.clear(...clear);
          }
        } else {
          target.clear();
        }
      }

      if (tex || prg) {
        const {
          tex: t
        } = batch;

        if (t) {
          if (t.id) {
            t.bind(0);
          } else if (isArray(t)) {
            t.forEach((e, i) => {
              e.bind(i);
            });
          } else {
            assign(batch.prg.tex, t);
          }
        }

        uni && assign(this.uni, uni);
        target.draw(batch.mesh, batch.prg, blend);
        values(batch).forEach(e => {
          e && e.disposeAfterUse && e.dispose();
        });
      } else {
        target.clear();
      }
    });

    _defineProperty(this, "createTextures", async desc => {
      const {
        loadTex
      } = this,
            t = await Promise.all(values(desc).map(loadTex));
      const x = keys(desc).reduce((x, p, i) => {
        const e = t[i];
        return { ...x,
          [p]: isArray(e) ? texArray(e) : e
        };
      }, {});
      return x;
    });

    _defineProperty(this, "createMeshes", async desc => {
      const {
        loadMesh
      } = this,
            t = await Promise.all(values(desc).map(loadMesh));
      return keys(desc).reduce((x, p, i) => ({ ...x,
        [p]: t[i]
      }), {});
    });

    _defineProperty(this, "createPrograms", async (v, f, p) => {
      const {
        loadPrg
      } = this;

      async function reduce(cb, init) {
        var acc = init;

        for (let e of this) {
          acc = await cb(acc, e);
        }

        return acc;
      }

      const {
        vs,
        fs
      } = this;
      var ve, fr;

      if (v) {
        ve = await reduce.call(entries(v), async (obj, [key, val]) => ({ ...obj,
          [key]: isArray(val) ? await vs.url(...val) : await vs.url(val)
        }), {});
      }

      if (f) {
        fr = await reduce.call(entries(f), async (obj, [key, val]) => ({ ...obj,
          [key]: isArray(val) ? await fs.url(...val) : await fs.url(val)
        }), {});
      }

      const pr = await reduce.call(entries(p), async (obj, [key, val]) => ({ ...obj,
        [key]: await loadPrg(val, ve, fr)
      }), {});
      ve && values(ve).forEach(e => {
        e.dispose();
      });
      fr && values(fr).forEach(e => {
        e.dispose();
      });
      return pr;
    });

    _defineProperty(this, "createRenderbuffers", desc => {
      const {
        rbo
      } = this;
      return entries(desc).reduce((x, [key, val]) => ({ ...x,
        [key]: rbo(...val)
      }), {});
    });

    _defineProperty(this, "loadTex", async t => {
      const {
        tex,
        loadTex
      } = this;

      if (typeof t === 'string') {
        return tex.url(t);
      } else if (isArray(t)) {
        const p = t[0];

        if (isFinite(p)) {
          return tex(...t);
        } else if (typeof p === 'string') {
          return tex.url(...t);
        } else if (p.then) {
          const t2 = await p,
                r = tex.data(t2, t[1]);
          t2.close && t2.close();
          return r;
        } else {
          return tex.data(...t);
        }
      } else if (typeof t === 'function') {
        const a = [];

        for (const e of t()) {
          a.push(loadTex(e));
        }

        return Promise.all(a);
      } else if (t.then) {
        const t2 = await t,
              r = tex.data(t2);
        t2.close && t2.close();
        return r;
      } else {
        return tex.data(t);
      }
    });

    _defineProperty(this, "loadPrg", async (p, v, f) => {
      const {
        vs,
        fs,
        prg,
        quadVS
      } = this,
            rx = /\.glsl$/i;

      if (isArray(p)) {
        const [a, b] = p;

        if (isArray(b) || typeof b === 'string') {
          var ve, fr;

          if (isArray(a)) {
            ve = await vs.url(...a);
          } else if (a.match(rx)) {
            ve = await vs.url(a);
          }

          if (isArray(b)) {
            fr = await fs.url(...b);
          } else if (b.match(rx)) {
            fr = await fs.url(b);
          }

          const pr = prg(ve || v[a], fr || f[b]);
          ve && ve.dispose();
          fr && fr.dispose();
          return pr;
        } else {
          const fr = await fs.url(a, b),
                pr = prg(quadVS, fr);
          fr.dispose();
          return pr;
        }
      } else if (p.match(rx)) {
        const fr = await fs.url(p),
              pr = prg(quadVS, fr);
        fr.dispose();
        return pr;
      } else {
        return prg(quadVS, f[p]);
      }
    });

    _defineProperty(this, "loadMesh", m => {
      const {
        mesh
      } = this;
      return isArray(m) ? mesh.url(...m) : mesh.url(m);
    });

    _defineProperty(this, "resolveTargets", t => {
      const {
        tex
      } = this.assets;

      if (isArray(t)) {
        return t.map(e => typeof e === 'string' ? tex[e][0] : e);
      } else if (typeof t === 'string') {
        return tex[t][0];
      } else {
        return t && t.id ? t[0] : t;
      }
    });

    _defineProperty(this, "resolveTextures", t => {
      const {
        tex
      } = this.assets;

      if (isArray(t)) {
        return t;
      } else if (typeof t === 'string') {
        return tex[t];
      } else if (t && t.id) {
        return t;
      } else {
        return t && entries(t).reduce((x, [key, val]) => ({ ...x,
          [key]: typeof val === 'string' ? tex[val] : val
        }), {});
      }
    });

    _defineProperty(this, "resolvePrograms", p => {
      const {
        paste,
        assets: {
          prg
        }
      } = this;
      return (typeof p === 'string' ? prg[p] : p) || paste;
    });

    _defineProperty(this, "resolveMeshes", m => {
      const {
        quad,
        assets: {
          mesh
        }
      } = this;
      return (typeof m === 'string' ? mesh[m] : m) || quad;
    });

    _defineProperty(this, "resolveRenderbuffers", r => {
      const {
        rbo
      } = this.assets;
      return typeof r === 'string' ? rbo[r] : r;
    });

    _defineProperty(this, "vs", assign((src, constants) => new VS(this.gl, src, constants), {
      url: (src, constants) => VS.url(this.gl, src, constants)
    }));

    _defineProperty(this, "fs", assign((src, constants) => new FS(this.gl, src, constants), {
      url: (src, constants) => FS.url(this.gl, src, constants)
    }));

    _defineProperty(this, "prg", assign((v, f) => new Prg(this.gl, v, f, this.map, this.ub), {
      unuse: () => {
        Prg.unuse(this.gl);
      }
    }));

    _defineProperty(this, "tex", assign((width, height, prop = {}) => {
      const {
        gl,
        fb,
        s2e
      } = this,
            {
        fmt = gl.RGBA8,
        srcFmt = gl.RGBA,
        type = gl.UNSIGNED_BYTE,
        mips = false,
        wrap = gl.REPEAT
      } = s2e(prop);
      return new Tex(gl, width, height, {
        fmt,
        srcFmt,
        type,
        mips,
        wrap
      }, fb);
    }, {
      url: (url, prop = {}) => Tex.url(this.gl, url, this.s2e(prop), this.fb),
      data: (data, prop = {}) => Tex.data(this.gl, data, this.s2e(prop), this.fb)
    }));

    _defineProperty(this, "buf", (type, usage) => new Buffer(this.gl, this.s2e(type), this.s2e(usage)));

    _defineProperty(this, "vbo", assign((usage = this.gl.STATIC_DRAW) => new VBO(this.gl, this.s2e(usage)), {
      unbind: () => {
        VBO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "ibo", assign((usage = this.gl.STATIC_DRAW) => new IBO(this.gl, this.s2e(usage)), {
      unbind: () => {
        IBO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "rbo", assign((w, h, fmt = this.gl.DEPTH24_STENCIL8) => new RBO(this.gl, w, h, this.s2e(fmt)), {}, {
      unbind: () => {
        RBO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "ubo", assign((usage = this.gl.DYNAMIC_DRAW) => new UBO(this.gl, this.s2e(usage), this.map), {}, {
      unbind: () => {
        UBO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "fbo", assign(() => new FBO(this.gl), {
      unbind: () => {
        FBO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "vao", assign((indexCount, attrCount) => new VAO(this.gl, indexCount, attrCount), {
      unbind: () => {
        VAO.unbind(this.gl);
      }
    }));

    _defineProperty(this, "mesh", assign((vert, indices, layout) => new Mesh(this.gl, vert, indices, layout), {
      url: (obj, computeTangentFrame = true, scale = 1.0) => Mesh.url(this.gl, obj, computeTangentFrame, scale)
    }));

    _defineProperty(this, "s2e", x => {
      if (typeof x === 'object') {
        Object.keys(x).forEach(e => {
          const y = x[e];

          if (typeof y === 'string') {
            x[e] = str2enum(this.gl, y);
          }
        });
      } else if (typeof x === 'string') {
        x = str2enum(this.gl, x);
      }

      return x;
    });

    const _ctx = new Ctx(canvas),
          {
      gl: _gl
    } = _ctx;

    this.gl = _gl;

    const {
      ubo,
      fbo,
      map
    } = this,
          ub = ubo(),
          _fb = fbo(),
          _quadVS = VS.quad(_gl);

    assign(this, {
      ctx: _ctx,
      fb: _fb,
      ub,
      quadVS: _quadVS,
      canvas,
      paste: Prg.paste(_gl, _quadVS, map, ub),
      quad: new Quad(_gl)
    });

    const _uni = new Proxy({}, {
      get: (tg, block) => {
        if (!ub.has(block)) throw `No such shader block: ${block}`;
        return new Proxy({}, {
          set: (tg, uniform, val) => {
            ub.setUniform(block, uniform, val);
            return true;
          }
        });
      },
      set: (tg, block, val) => {
        if (!ub.has(block)) throw `No such shader block: ${block}`;

        if (isArray(val) || isFinite(val)) {
          const uniforms = keys(ub.uniformOffsets[block]);

          if (uniforms.length === 1) {
            ub.setUniform(block, uniforms[0], val);
          } else {
            throw `Attempting to shortcut uniform assignment, but destination block ${block} contains multiple uniforms.`;
          }
        } else {
          keys(val).forEach(e => {
            ub.setUniform(block, e, val[e]);
          });
        }

        return true;
      }
    });

    defineProperty(this, 'uni', {
      set(blocks) {
        assign(_uni, blocks);
      },

      get() {
        return _uni;
      }

    });
  }

}

function str2enum(gl, str) {
  return gl[str.replace('-', '_').toUpperCase()];
}
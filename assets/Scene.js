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

const { defineProperty, assign, keys, entries, values, create } = Object,
{ isArray } = Array,
{ isFinite } = Number;

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
  map = {}

  constructor(canvas) {
    const ctx = new Ctx(canvas),
    { gl } = ctx;
    this.gl = gl;
    const { ubo, fbo, map } = this,
    ub = ubo(),
    fb = fbo(),
    quadVS = VS.quad(gl);

    assign(this, {
      ctx, fb, ub, quadVS, canvas,
			paste: Prg.paste(gl, quadVS, map, ub),
			quad: new Quad(gl)
    });

    const uni = new Proxy({}, {
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
        assign(uni, blocks);
      },
      get() {
        return uni;
      }
    });
  }

  init = async setup => {
    const { assets, ext, scheme, statics, uni } = setup,
    { ctx, createTextures, createMeshes, createPrograms, createRenderbuffers, render } = this,
    { tex, mesh, prg, rbo } = assets;

    ext && (isArray(ext) ? ext.forEach(e => { ctx.ext(e); }) : ctx.ext(ext));

    this.assets = {
      tex: assign(tex && await createTextures(tex) || {}, {
        async put(dyn) {
          keys(dyn).forEach(e => this[e] && this[e].dispose());
          assign(this, await createTextures(dyn));
        }
      }),
      mesh: assign(mesh && await createMeshes(mesh) || {}, {
        async put(dyn) {
          keys(dyn).forEach(e => this[e] && this[e].dispose());
          assign(this, await createMeshes(dyn));
        }
      }),
      prg: assign(prg && await createPrograms(prg) || {}, {
        async put(dyn) {
          keys(dyn).forEach(e => this[e] && this[e].dispose());
          assign(this, await createPrograms(dyn));
        }
      }),
      rbo: assign(rbo && await createRenderbuffers(rbo) || {}, {
        async put(dyn) {
          keys(dyn).forEach(e => this[e] && this[e].dispose());
          assign(this, await createRenderbuffers(dyn));
        }
      })
    };

    assign(this, {
      uni, scheme, statics
    });
	}

  render = arg => {
    const { execute } = this;
    if (typeof arg[Symbol.iterator] === 'function') {
      for (const dir of arg) {
        execute(dir);
      }
    } else {
      execute(arg);
    }
  }

  execute = dir => {
    const { prg, tex, mesh, tg, z, uni, blend, clear } = dir,
    { ctx, fb, assets, resolvePrograms, resolveTextures, resolveTargets, resolveMeshes, resolveRenderbuffers } = this,

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
      const { tex: t } = batch;
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
  }

  createTextures = async desc => {
    const { loadTex } = this,
    t = await Promise.all(values(desc).map(loadTex));
    const x = keys(desc).reduce((x, p, i) => {
      const e = t[i];
      return {
        ...x,
        [p]: isArray(e) ? texArray(e) : e
      };
    }, {});
    return x;
  }

  createMeshes = async desc => {
    const { loadMesh } = this,
    t = await Promise.all(values(desc).map(loadMesh));
    return keys(desc).reduce((x, p, i) => ({
      ...x,
      [p]: t[i]
    }), {});
  }

  createPrograms = async p => {
    const { loadPrg } = this;

    async function asyncReduce(cb, init) {
      var acc = init;
      for (let e of this) {
        acc = await cb(acc, e);
      }
      return acc;
    }

    return await asyncReduce.call(entries(p), async (obj, [key, val]) => ({
      ...obj,
      [key]: await loadPrg(val)
    }), {});
  }

  createRenderbuffers = desc => {
    const { rbo } = this;
    return entries(desc).reduce((x, [key, val]) => ({
      ...x,
      [key]: rbo(val.width, val.height, val.fmt)
    }), {});
  }

  loadTex = async t => {
    const { tex, loadTex } = this;
    if (typeof t === 'string') {
      return await tex.url(t);
    } else if (t.src && typeof t.onload === 'undefined') {
      if (typeof t.src === 'string') {
        return await tex.url(t.src, t);
      } else {
        return tex.data(t.src, t);
      }
    } else if (typeof t[Symbol.iterator] === 'function') {
      return await Promise.all([...t].map(loadTex));
    } else if (t.width) {
      return tex(t.width, t.height, t);
    } else {
      return tex.data(t);
    }
  }

  loadPrg = async p => {
    const { vs, fs, prg, quadVS } = this;
    let v, f;
    if (p.vs) {
      if (typeof p.vs === 'string') {
        v = await vs.url(p.vs);
      } else {
        v = await vs.url(p.vs.src, p.vs.var);
      }
    }
    if (typeof p.fs === 'string') {
      f = await fs.url(p.fs);
    } else {
      f = await fs.url(p.fs.src, p.fs.var);
    }
    const pr = prg(v || quadVS, f);
    v && v.dispose();
    f.dispose();
    return pr;
  }

  loadMesh = m => {
    const { mesh } = this;
    return typeof m === 'string' ? mesh.url(m) : mesh.url(m.src, m.computeTangentFrame, m.scale);
  }

  resolveTargets = t => {
    const { tex } = this.assets;
    if (isArray(t)) {
      return t.map(e => typeof e === 'string' ? tex[e][0] : e);
    } else if (typeof t === 'string') {
      return tex[t][0];
    } else {
      return t && t.id ? t[0] : t;
    }
  }

  resolveTextures = t => {
    const { tex } = this.assets;
    if (isArray(t)) {
      return t;
    } else if (typeof t === 'string') {
      return tex[t];
    } else if (t && t.id) {
      return t;
    } else {
      return t &&
      entries(t).reduce((x, [key, val]) => ({
        ...x,
        [key]: typeof val === 'string' ? tex[val] : val
      }), {});
    }
  }

  resolvePrograms = p => {
    const { paste, assets: { prg } } = this;
    return (typeof p === 'string' ? prg[p] : p) || paste;
  }

  resolveMeshes = m => {
    const { quad, assets: { mesh } } = this;
    return (typeof m === 'string' ? mesh[m] : m) || quad;
  }

  resolveRenderbuffers = r => {
    const { rbo } = this.assets;
    return typeof r === 'string' ? rbo[r] : r;
  }

	vs = assign((src, constants) => new VS(this.gl, src, constants), {
		url: (src, constants) => VS.url(this.gl, src, constants),
	})

	fs = assign((src, constants) => new FS(this.gl, src, constants), {
		url: (src, constants) => FS.url(this.gl, src, constants)
	})

	prg = assign((v, f) => new Prg(this.gl, v, f, this.map, this.ub), {
		unuse: () => {
			Prg.unuse(this.gl);
		}
  })

	tex = assign((width, height, prop = {}) => {
    const { gl, fb, s2e } = this,
		{ fmt = gl.RGBA8, srcFmt = gl.RGBA, type = gl.UNSIGNED_BYTE, mips = false, wrap = gl.REPEAT } = s2e(prop);
		return new Tex(gl, width, height, { fmt, srcFmt, type, mips, wrap }, fb);
	}, {
		url: (url, prop = {}) => Tex.url(this.gl, url, this.s2e(prop), this.fb),
		data: (data, prop = {}) => Tex.data(this.gl, data, this.s2e(prop), this.fb)
	})

	buf = (type, usage) => new Buffer(this.gl, this.s2e(type), this.s2e(usage))

	vbo = assign((usage = this.gl.STATIC_DRAW) => new VBO(this.gl, this.s2e(usage)), {
		unbind: () => {
			VBO.unbind(this.gl);
		}
	})

	ibo = assign((usage = this.gl.STATIC_DRAW) => new IBO(this.gl, this.s2e(usage)), {
		unbind: () => {
			IBO.unbind(this.gl);
		}
	})

	rbo = assign((width, height, fmt = this.gl.DEPTH24_STENCIL8) => new RBO(this.gl, width, height, this.s2e(fmt)), {
	}, {
		unbind: () => {
			RBO.unbind(this.gl);
		}
  })

	ubo = assign((usage = this.gl.DYNAMIC_DRAW) => new UBO(this.gl, this.s2e(usage), this.map), {
	}, {
		unbind: () => {
			UBO.unbind(this.gl);
		}
	})

	fbo = assign(() => new FBO(this.gl), {
		unbind: () => {
			FBO.unbind(this.gl);
		}
  })

	vao = assign((indexCount, attrCount) => new VAO(this.gl, indexCount, attrCount), {
		unbind: () => {
			VAO.unbind(this.gl);
		}
  })

	mesh = assign((vert, indices, layout) => new Mesh(this.gl, vert, indices, layout), {
		url: (obj, computeTangentFrame = true, scale = 1.0) => Mesh.url(this.gl, obj, computeTangentFrame, scale),
	})

	s2e = x => {
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
	}
}

function str2enum(gl, str) {
	return gl[str.replace('-', '_').toUpperCase()];
}

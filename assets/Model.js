import VAO from './VAO.js';
import VBO from './VBO.js';
import IBO from './IBO.js';
import { mul, sub, add, dot, nrm } from './vec.js';
import { sub2, cross2 } from './vec2.js';

const { assign } = Object;

function Model(ctx, vertices, indices, vertexLayout) {
	const { gl } = ctx;
	const x = Float32Array.from(vertices);
	const y = Uint16Array.from(indices);

	const stride = vertexLayout.reduce((sum, e) => sum + 4 * e, 0);

	assign(this, {
		gl,
		cull: true,
		back: false,
		ztest: true,
		zwrite: true,
		va: new VAO(ctx, indices.length, vertexLayout.length),
		vb: new VBO(ctx, gl.STATIC_DRAW),
		ib: new IBO(ctx, gl.STATIC_DRAW)
	});

	const { va, vb, ib } = this;

	va.bind();
	vb.bind();
	vb.data(x);
	ib.bind();
	ib.data(y);

	var offset = 0;

	for (let i = 0; i < vertexLayout.length; i++) {
		gl.vertexAttribPointer(i, vertexLayout[i], gl.FLOAT, false, stride, offset);
		gl.enableVertexAttribArray(i);
		offset += 4 * vertexLayout[i];
	}

	VAO.unbind(gl);
	VBO.unbind(gl);
	IBO.unbind(gl);
}

Model.prototype = {
	drawElements() {
		const { gl, va } = this;
		va.bind();
		gl.drawElements(gl.TRIANGLES, va.indexCount, gl.UNSIGNED_SHORT, 0);
		VAO.unbind(gl);
	},

	draw() {
		const { gl, cull, back, ztest, zwrite } = this;
		if (cull) {
			gl.enable(gl.CULL_FACE);
			gl.cullFace(back ? gl.FRONT : gl.BACK);
		} else {
			gl.disable(gl.CULL_FACE);
		}

		if (ztest) {
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}
		gl.depthMask(zwrite);
		this.drawElements();
	},

	dispose() {
		const { va, vb, ib } = this;
		va.dispose();
		vb.dispose();
		ib.dispose();
	}
};

Model.url = async (ctx, obj, computeTangentFrame, scale) => {
	const res = await fetch(obj);
	const data = await res.text();
	const p = [], n = [], p1 = [], n1 = [], t = [],
	t1 = [], f = [], m = {}, g = [];
	var k = 0, d = [];

	const s = data.split(/\n/);
	for (let q of s) {
		let r = q.split(" ");
		if (r[0] == "v") {
			p.push([ parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]) ]);
		} else if (r[0] == "vt") {
			r = q.split(" ");
			t.push([ parseFloat(r[1]), parseFloat(r[2]) ]);
		} else if (r[0] == "vn") {
			r = q.split(" ");
			n.push([ parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3]) ]);
		} else if (r[0] == "f") {
			for (let i = 0; i < 3; i++) {
				q = r[i + 1];
				if (!m.q) {
					m[q] = k;
					f.push(k++);
					const w = q.split(/\/+/);
					let b = parseInt(w[0]) - 1;
					p1.push(mul(p[b], scale));
					let e = 0;

					if (t.length > 0) {
						b = parseInt(w[1]) - 1;
						t1.push(t[b]);
						e = 1;
					}
					if (n.length > 0) {
						b = parseInt(w[e + 1]) - 1;
						n1.push(n[b]);
					}
				} else {
					f.push(m[q]);
				}
			}
		}
	}

	if (computeTangentFrame && (t.length > 0) && (n.length > 0)) {
		const ta = new Map();
		const ba = new Map();

		for (let i = 0; i < f.length; i += 3) {
			const u = [ f[i], f[i + 1], f[i + 2] ];

			for (let j = 0; j < 3; j++) {
				const q = (j + 1) % 3;
				const r = (j + 2) % 3;
				const c = u[j];
				const vp = p1[c];
				const vt = t1[c];
				const dp1 = sub(p1[u[q]], vp);
				const dt1 = sub2(t1[u[q]], vt);
				const dp2 = sub(p1[u[r]], vp);
				const dt2 = sub2(t1[u[r]], vt);

				const x = 1.0 / cross2(dt1, dt2);
				const tan = mul(sub(mul(dp1, dt2[1]), mul(dp2, dt1[1])), x);
				const bit = mul(sub(mul(dp2, dt1[0]), mul(dp1, dt2[0])), x);
				ta.set(c, ta.has(c) ? ta.get(c).concat([tan]) : [tan]);
				ba.set(c, ba.has(c) ? ba.get(c).concat([bit]) : [bit]);
			}
		}

		for (let i = 0; i < p1.length; i++) {
			g.push(...p1[i]);
			g.push(...t1[i]);
			const v = n1[i];
			g.push(...v);

			const tan = ta.get(i);
			const bit = ba.get(i);
			var ts = [0, 0, 0];
			var bs = [0, 0, 0];

			for (let j = 0; j < tan.length; j++) {
				ts = add(ts, tan[j]);
				bs = add(bs, bit[j]);
			}
			ts = nrm(add(ts, mul(v, -dot(v, ts))));
			bs = nrm(add(bs, mul(v, -dot(v, bs))));

			g.push(...ts);
			g.push(...bs);
		}

		d = [3, 2, 3, 3, 3];
	} else {
		for (let i = 0; i < p1.length; i++) {
			g.push(...p1[i]);

			if (t1.length > 0) {
				g.push(...t1[i]);
			}

			if (n1.length > 0) {
				g.push(...n1[i]);
			}
		}
		if (t.length > 0) {
			if (n.length > 0) {
				d = [3, 2, 3];
			} else {
				d = [3, 2];
			}
		} else if (n.length > 0) {
			d = [3, 3];

		} else {
			d = [3];
		}
	}
	return new Model(ctx, g, f, d);
};

export default Model;

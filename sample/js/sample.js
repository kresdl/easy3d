import { mat, Ctx } from 'easy3d';

init();

async function init() {
	var rd = 0;
	const c = document.querySelector('canvas');
	const w = c.width;
	const h = c.height;
	const ctx = new Ctx(c);

	const { tex, prg, quad, paste } = ctx;
	ctx.ext('EXT_color_buffer_float');

	const qv = await ctx.vs.url('/data/quad_v.glsl');
	const { url } = ctx.fs;

	const df = await url('/data/disp_f.glsl');
	const cf = await url('/data/comb_f.glsl');

	const t = await getPattern(w, h);
	const s1 = tex.data(t);
	var s = tex(w, h, { fmt: 'rgba16f' });
	s1.bind(0);
	s[0].draw(quad, paste);
	t.close();
	s1.dispose();

	var w2 = w;
	var h2 = h;

	const disp = prg(qv, df);
	const comb = prg(qv, cf);
	const uni = ctx.ubo();

	uni.f1.size = w;

	const d1 = [];

	while (h2 > 1) {
		let t = await getVectors(w2, h2);
		d1.push(tex.data(t));
		t.close();
		w2 /= 2;
		h2 /= 2;
	}

	var d = tex(w, h, { fmt: 'rgba16f' });
	const v = tex(w, h, { fmt: 'rgba16f' });

	d1.forEach((e, i) => e.bind(i));
	v[0].draw(quad, comb);
	d1.forEach(e => e.dispose());

	$('#loading').hide();
	c.style.display = 'block';
	main();

	function main() {
		uni.m1.mat = mat.rz(rd);
		s.bind(0);
		v.bind(1);
		d[0].draw(quad, disp);
		d.bind(0);
		ctx.draw(quad, paste);
		[s, d] = [d, s];
		requestAnimationFrame(main);
		rd -= 0.001;
	}
}

function getVectors(w, h) {
	const img = new ImageData(w, h);
	const d = img.data;
	for (let y = 0; y < h; y++) {
		let q = 4 * w * y;
		for (let x = 0; x < w; x++) {
			d[q] = 255 * Math.random();
			d[q + 1] = 255 * Math.random();
			d[q + 2] = 255 * Math.random();
			q += 4;
		}
	}
	return getBitmap(img);
}

function getPattern(w, h) {
	const img = new ImageData(w, h);
	const d = img.data;
	for (let y = 0; y < h; y++) {
		let q = 4 * w * y;
		for (let x = 0; x < w; x++) {
			d[q++] = 128 - ((x - y) % 255);
			d[q++] = 255 - ((y + x) % 255);
			d[q++] = (y + x / y) % 255;
			d[q++] = 255;
		}
	}
	return getBitmap(img);
}

function getBitmap(data) {
	return createImageBitmap(data, 0, 0, data.width, data.height, { premultiplyAlpha: 'none' });
}

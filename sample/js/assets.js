import { WIDTH as w, HEIGHT as h } from './constants';

export default {
	prg: {
		torus: ['./data/torus_v.glsl', './data/torus_f.glsl'],
		blurx: './data/blurx_f.glsl',
		blury: './data/blury_f.glsl',
		blend: './data/blend_f.glsl',
		fade: './data/fade_f.glsl'
	},
	mesh: {
		torus: ['https://kresdl.com/mblur/data/munk.obj', false]
	},
	tex: {
		col: [w, h, { fmt: 'rgb8' }],
		halo: [w, h, { mips: 6, fmt: 'rgb8', wrap: 'clamp-to-edge' }],
		bx: [w, h, { fmt: 'rgba16f', wrap: 'clamp-to-edge' }],
		bxy: [w, h, { fmt: 'rgb8' }],
		mb: [w, h, { fmt: 'rgb8' }]
	},
	rbo: {
		z: [w, h]
	}
};

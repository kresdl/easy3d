import { WIDTH as w, HEIGHT as h } from './constants';

export default {
	prg: {
		torus: ['/mblur/data/torus_v.glsl', '/mblur/data/torus_f.glsl'],
		blurx: '/mblur/data/blurx_f.glsl',
		blury: '/mblur/data/blury_f.glsl',
		blend: '/mblur/data/blend_f.glsl',
		fade: '/mblur/data/fade_f.glsl'
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

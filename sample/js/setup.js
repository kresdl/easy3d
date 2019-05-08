import { WIDTH as width, HEIGHT as height } from './constants';

//Asset definitions

import assets from './assets';

//Render pass logic

import scheme from './schemes';

//Initialize shader uniforms

const SIZE = 5,
weights = [],
d = 1.0 / SIZE;
var x = d;

for (let i = 0; i < SIZE; i++) {
	let t = x * d;
	weights.push(t, t, t, t);
	x += d;
}
for (let i = 0; i < (SIZE - 1); i++) {
	let t = weights[4 * (SIZE - i - 2)];
	weights.push(t, t, t, t);
}

export default {
	em: 'canvas',
	width,
	height,
	ext: 'EXT_color_buffer_float',
	uni: {
		weights
	},
	assets,
	scheme
}

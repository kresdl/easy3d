export default function* (mvp) {
	const { tex } = this.assets;

	//Draw torus with two versions of vertex coloring

	yield {
		prg: 'torus',
		mesh: 'torus',
		uni: {	//Set uniforms
			mvp
		},
		clear: true,	//Clear targets
		tg: ['col', 'halo'],	//Multiple targets
		z: 'z'	//Offscreen depth buffer
	};

	//Blur version 2 horisontally

	yield {
		prg: 'blurx',
		tex: tex.halo.mip(),	//Generate mip-levels for the shader to be able to sample at a specific LOD
		tg: 'bx'
	};

	//Blur the result vertically -> bxy

	yield {
		prg: 'blury',
		tex: 'bx',
		tg: 'bxy'
	};

	//Paste version 1 with transparency -> mb

	yield {
		prg: 'fade',
		blend: true,	//Draw on top of target
		tex: 'col',
		tg: 'mb'
	};

	//Blend mb and mxy together

	yield {
		prg: 'blend',
		tex: {
			blur: 'mb',
			halo: 'bxy'
		}
	};
}

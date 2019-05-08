export default function* (mvp) {
	const { tex } = this.assets;

	yield {
		prg: 'torus',
		mesh: 'torus',
		uni: {
			mvp
		},
		clear: true,
		tg: ['col', 'halo'],
		z: 'z'
	};

	yield {
		prg: 'blurx',
		tex: tex.halo.mip(),
		tg: 'bx'
	};

	yield {
		prg: 'blury',
		tex: 'bx',
		tg: 'bxy'
	};

	yield {
		prg: 'fade',
		blend: true,
		tex: 'col',
		tg: 'mb'
	};

	yield {
		prg: 'blend',
		tex: {
			blur: 'mb',
			halo: 'bxy'
		}
	};
}

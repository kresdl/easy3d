export default function(gl, mode = 'over') {
	if (mode) {
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		switch (mode.toLowerCase()) {
			case 'over':
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
			case 'atop':
				gl.blendFunc(gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
			case 'in':
				gl.blendFunc(gl.DST_ALPHA, gl.ZERO);
				break;
			case 'out':
				gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ZERO);
				break;
			case 'dest over':
				gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.DST_ALPHA);
				break;
			case 'dest atop':
				gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA);
				break;
			case 'dest in':
				gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
				break;
			case 'dest out':
				gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
				break;
		}
	} else {
		gl.disable(gl.BLEND);
	}
}

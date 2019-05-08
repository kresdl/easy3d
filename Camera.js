import { view, glView, proj, glProj, concat } from './mat.js';

export default class {
	constructor(pos, target, aspectRatio, zNear, zFar, fov, glSpace = true) {
		Object.assign(this, {
			pos, glSpace
		});

		[this.view, this.proj] = glSpace ?
		[glView(pos, target), glProj(zNear, zFar, fov, aspectRatio)] :
		[view(pos, target), proj(zNear, zFar, fov, aspectRatio)];
	}

	move(pos, target) {
		this.view = glSpace ? glView(pos, target) : view(pos, target);
	}

	get matrix() {
		return concat(this.view, this.proj);
	}
};
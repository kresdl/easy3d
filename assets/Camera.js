import { view, glView, proj, glProj, conc } from './mat.js';

function Camera(pos, target, aspectRatio, zNear, zFar, fov, glSpace = true) {
	this.pos = pos;
	this.glSpace = glSpace;

	[this.view, this.proj] = glSpace ?
	[glView(pos, target), glProj(zNear, zFar, fov, aspectRatio)] :
	[view(pos, target), proj(zNear, zFar, fov, aspectRatio)];
}

Camera.prototype = {
	move(pos, target) {
		this.view = glSpace ? glView(pos, target) : view(pos, target);
	},

	get matrix() {
		return conc(this.view, this.proj);
	}
};

export default Camera;

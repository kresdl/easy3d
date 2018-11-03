import mat from './mat.js';

function Camera(pos, target, aspectRatio, zNear, zFar, fov, glSpace = true) {
	this.pos = pos;
	this.glSpace = glSpace;

	[this.view, this.proj] = glSpace ?
	[mat.glView(pos, target), mat.glProj(zNear, zFar, fov, aspectRatio)] :
	[mat.view(pos, target), mat.proj(zNear, zFar, fov, aspectRatio)];
}

Camera.prototype = {
	move(pos, target) {
		this.view = glSpace ? mat.glView(pos, target) : mat.view(pos, target);
	},

	get matrix() {
		return mat.mul(this.view, this.proj);
	}
};

export default Camera;

import Scene from './assets/Scene.js';

export default async function(setup) {
	const { em, width, height } = setup,
	canvas = document.getElementById(em);
	Object.assign(canvas, { width, height });
	const scene = new Scene(canvas);
	await scene.init(setup);
	return scene;
}

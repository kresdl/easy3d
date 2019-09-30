import Scene from './assets/Scene';

export default async function(setup, abortSignal) {
	const { em, width, height } = setup,
	canvas = em;
	Object.assign(canvas, { width, height });
	const scene = new Scene(canvas);

	try {
		await scene.init(setup, abortSignal);
		return scene;
	} catch (e) {
		scene.dispose();
		throw e;		
	}
}

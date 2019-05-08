import { Camera, createScene, rotate, concat } from 'easy3d';
import setup from './setup';

load();

async function load() {

	//Create scene from setup then grab canvas element and render method.

	const { canvas, render } = await createScene(setup),
	vp = new Camera([0, 0, 165], [0, 0, 0], 1, 25, 1000, 1).matrix;

	var mx = 0, my = 0;

	document.getElementById('loading').style.display = 'none';
	canvas.style.display = 'block';

	main();

	function main() {

		//Invoke render method with matrix (or any object) as argument to pass it on to scheme.

		render(concat(rotate(my * 0.005, -mx * 0.005, 0), vp))
		mx += 4.0;
		my += 5.0;
		requestAnimationFrame(main)
	}
}

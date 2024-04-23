import { RED } from './colors.js';

const doc = document;
const $ = (q) => doc.querySelector(q);
const $id = (id) => doc.getElementById(id);
const $html = (id, h) => $id(id).innerHTML = h;
function flashBorder(id, color = RED, duration = 1500) {
	const animation = new Animation(
		(new KeyframeEffect(
			$id(id), // Element
			[ // Keyframes
				{ borderColor: color },
				{ borderColor: '#000' },
			],
			{ duration, direction: 'alternate', easing: 'linear' } // key frame settings
		)),
		doc.timeline,
	);
	animation.play();
}
export { doc, $, $html, $id, flashBorder };

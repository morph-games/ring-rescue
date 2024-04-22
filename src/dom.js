import { RED } from './colors.js';

const doc = document;
const $id = (id) => doc.getElementById(id);
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
export { doc, $id, flashBorder };

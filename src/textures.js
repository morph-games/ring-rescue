import { $id, doc } from './dom.js';
import { STAR_COLOR, PLASMA_COLOR1, PLASMA_COLOR2, PLASMA_COLOR3, RING_COLOR } from './colors.js';
import { loop, PI, TWO_PI, cos, sin, getXYCoordinatesFromPolar } from './utils.js';

function makeCanvas(id, size) {
	const existingElt = $id(id);
	const elt = existingElt || doc.createElement('canvas');
	elt.id = id;
	elt.width = elt.height = size;
	if (!existingElt) $id('loaded').appendChild(elt);
	return [elt, elt.getContext('2d'), size / 2];
}

function makeStarFieldCanvas(id, gen) {
	const size = 800;
	const [cElt, c] = makeCanvas(id, size);
	loop(1400, () => {
		c.rect(gen.int(0, size), gen.int(0, size), 1, 1);
	});
	c.fillStyle = STAR_COLOR;
	c.fill();
	return cElt;
}

function makeStarCanvas(points = 4, color = '#f00', id, depth = .4, size = 600) {
	const [cElt, c, h] = makeCanvas(id, size);
	c.clearRect(0, 0, size, size);
	c.beginPath();
	const a = TWO_PI / points;
	const line = (a, r) => {
		const { x, y } = getXYCoordinatesFromPolar(a, r);
		c.lineTo(h + x, h + y);
	};
	loop(points, (i) => {
		line(a * i, h);
		line(a * i + (a / 2), h * depth);
	});
	c.fillStyle = color;
	c.fill();
	return cElt;
}

function makeRabbit(front) {
	const [cElt, c] = makeCanvas('rabbit' + front, 600);
	c.beginPath();
	c.moveTo(10, 600);
	const points = [
		[10, 600],
		[50, 550],
		[100, 520],
		[270, 480],
		[270, 450],
		// [100, 410, 0, 0, 100],
		// [80, 300],
	];
	points.forEach((pts) => c.lineTo(...pts));
	points.reverse().forEach(([x, y]) => c.lineTo(600 - x, y));
	c.fillStyle = RING_COLOR;
	c.fill();
	c.closePath();

	const e = (x, y, radiusX, radiusY, rot = 0, color = '#eee', opt = {}) => {
		c.beginPath();
		c.ellipse(x, y, radiusX, radiusY, rot, 0, TWO_PI);
		c.fillStyle = color;
		c.fill();
		if (opt.hook) opt.hook();
		c.closePath();
	};

	if (front) {
		// Neck
		e(300, 400, 100, 160, 0, '#8bc7bf');
	}
	// Head
	e(300, 300, 200, 70);
	e(300, 350, 250, 100);
	e(300, 410, 200, 60);
	// Ears
	e(150, 200, 200, 40, PI * .4);
	e(450, 200, 200, 40, -PI * .4);
	if (front) {
		// Eyes
		e(430, 320, 20, 30, 0, '#445');
		e(170, 320, 20, 30, 0, '#445');
		e(440, 290, 16, 40, PI * -1.4, '#ccc');
		e(160, 290, 16, 40, PI * 1.4, '#ccc');
		// Nose
		e(300, 350, 20, 10, 0, '#de8b6f');

		// Mouth
		c.beginPath();
		c.moveTo(300, 450);
		c.lineTo(150, 400);
		c.lineTo(450, 400);
		c.fillStyle = '#222';
		c.fill();
		c.closePath();
	}

	// helmet 
	const hook = () => {
		c.strokeStyle = '#8bc7bf';
		c.lineWidth = 10;
		c.stroke();
	};
	e(300, 320, 290, 180, 0, '#ffffff55', { hook });

	// $id('loaded').style.display = 'block';
	// cElt.style.position = 'absolute';
	// cElt.style.top = '0';
	// cElt.style.left = '0';
	// cElt.style.background = '#000';
	// cElt.style.zIndex = '99';
	return cElt;
}

function makeTextures() {
	return {
		tf: makeStarCanvas(9, STAR_COLOR, 'tf', .3),
		plasma: makeStarCanvas(11, PLASMA_COLOR1, 'plasma', .2),
		photon: makeStarCanvas(13, PLASMA_COLOR2, 'photon', .5),
		klaxPlasma: makeStarCanvas(15, PLASMA_COLOR3, 'klaxPlasma', .3),
		rabbit: makeRabbit(1),
		pilot: makeRabbit(0),
	};
}

export { makeStarCanvas, makeStarFieldCanvas, makeTextures, makeRabbit };

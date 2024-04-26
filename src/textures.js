import { $id, doc } from './dom.js';
import { STAR_COLOR, PLASMA_COLOR1, PLASMA_COLOR2, PLASMA_COLOR3, RING_COLOR, SCAN_COLOR } from './colors.js';
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
	const arr = [];
	const a = TWO_PI / points;
	const line = (a, r) => {
		const { x, y } = getXYCoordinatesFromPolar(a, r);
		arr.push([h + x, h + y]);
	};
	loop(points, (i) => {
		line(a * i, h);
		line(a * i + (a / 2), h * depth);
	});
	path(c, arr, color);
	return cElt;
}

function path(c, arr, fillStyle, strokeArr) {
	c.beginPath();
	if (typeof arr === 'function') {
		arr();
	} else {
		c.moveTo(...arr[0]);
		arr.forEach((pts) => c.lineTo(...pts));
	}
	if (fillStyle) {
		c.fillStyle = fillStyle;
		c.fill();
	}
	if (strokeArr) {
		c.strokeStyle = strokeArr[0]; // '#8bc7bf';
		c.lineWidth = strokeArr[1];
		c.stroke();
	}
	c.closePath();
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

	const e = (x, y, radiusX, radiusY, rot = 0, color = '#eee', strokeArr) => {
		path(c, () => {
			c.ellipse(x, y, radiusX, radiusY, rot, 0, TWO_PI);
		}, color, strokeArr);
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
		path(c, [[300, 450], [150, 400], [450, 400]], '#222');
	}

	// helmet 
	e(300, 320, 290, 180, 0, '#ffffff55', ['#8bc7bf', 10]);

	// $id('loaded').style.display = 'block';
	// cElt.style.position = 'absolute';
	// cElt.style.top = '0';
	// cElt.style.left = '0';
	// cElt.style.background = '#000';
	// cElt.style.zIndex = '99';
	return cElt;
}

function makeHopArmor(c1, c2) {
	const [cElt, c] = makeCanvas(`hopArmor${c1}${c2}`, 50);
	path(c, [[0,0], [0,50], [50,50], [50,0], [0,0]], c1, [c2, 6]);
	path(c, [[10, 0], [10, 10], [40, 10], [40, 0]], null, [c2, 2]);
	path(c, [[0, 30], [20, 30], [20, 40], [50, 40]], null, [c2, 2]);
	return cElt;
}

// function makeCircle(color) {
// 	const [cElt, c] = makeCanvas(`circle${color}`, 400);
// 	path(c, () => {
// 		c.arc(200, 200, 190, 0, TWO_PI);
// 		// c.ellipse(200, 200, 190, 190, 0, 0, TWO_PI);
// 	}, '#000', [color, 10]);
// 	return cElt;
// }

function makeTextures() {
	return {
		tf: makeStarCanvas(9, STAR_COLOR, 'tf', .3),
		plasma: makeStarCanvas(11, PLASMA_COLOR1, 'plasma', .2),
		photon: makeStarCanvas(13, PLASMA_COLOR2, 'photon', .5),
		klaxPlasma: makeStarCanvas(15, PLASMA_COLOR3, 'klaxPlasma', .3),
		rabbit: makeRabbit(1),
		pilot: makeRabbit(0),
		scan: makeStarCanvas(8, PLASMA_COLOR3, 'scan', 1),
	};
}

export { makeStarCanvas, makeStarFieldCanvas, makeTextures, makeRabbit, makeHopArmor };

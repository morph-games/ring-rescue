import { $id, doc } from './dom.js';
import { STAR_COLOR, PLASMA_COLOR1, PLASMA_COLOR2, PLASMA_COLOR3 } from './colors.js';
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

function makeTextures() {
	return {
		tf: makeStarCanvas(9, STAR_COLOR, 'tf', .3),
		plasma: makeStarCanvas(11, PLASMA_COLOR1, 'plasma', .2),
		photon: makeStarCanvas(13, PLASMA_COLOR2, 'photon', .5),
		klaxPlasma: makeStarCanvas(15, PLASMA_COLOR3, 'klaxPlasma', .3),
	};
}

export { makeStarCanvas, makeStarFieldCanvas, makeTextures };

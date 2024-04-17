import W from './w.esm.js';
import input from './input.js';
import { vec3 } from './Vector3.js';
import RandomGenerator from './RandomGenerator.js';
// const { W } = window;

// Note that max distance is 1000
// So world can be -500 --> 500 in any dimensions
// Solar system is 30 trillion km diameter
// so if the scale matches, then each 1.0 unit = 30 billion km
const MAX_VEL = 1000;
const SPACE_SIZE = 499;
const skyboxDist = SPACE_SIZE;
const PI = Math.PI;
const TWO_PI = PI * 2;
const VEL_FRICTION = 1 / 10000;
const SHIP_THRUST = 0.01;

const doc = document;

const shipSize = 0.3;
const sun = { rx: 0, ry: 0, ry: 0 };
const ship = {
	x: 0, y: 0, z: SPACE_SIZE,
	rx: -90, ry: 0, rz: 0,
	vel: { x: 0, y: 0, z: -36 },
	thrust: { x: 0, y: 0, z: 0 },
};
const t = 1000 / 60;
const camOffset = { back: -shipSize * 5, up: shipSize * 1.7, rx: 80, ry: 0, rz: 0 };
let rotation = 0;
const steer = { rx: -90, ry: 0, rz: 0 };
const physicsEnts = [ship];
const gen = new RandomGenerator(123);
const BG_COLOR = '2a242b';
const SHIP_COLOR = '8bc7bf';
const RING_COLOR = '5796a1';
const P1_COLOR = '524bb3';
const P2_COLOR = 'b0455a';
const SUN_COLOR = '#de8b6f'; // 'ff6633'
const STAR_COLOR = '#ebd694';
const SPACE_COLOR = '0000';
// 471b6e
// 702782
// de8b6f
// ebd694

function rad2deg(rad) { return rad * (180/PI); }
function deg2rad(deg) { return deg * (PI/180); }
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }

function rotateByDegree(v, o) {
	return v.rotate(deg2rad(o.rx), deg2rad(o.ry), deg2rad(o.rz));
}
function getDirectionUnit(o) {
	return rotateByDegree(vec3(0, 1, 0), o);
}
function addAngles(a, b) {
	let { rx, ry, rz } = a;
	rx += b.rx;
	ry += b.ry;
	rz += b.rz;
	return { rx, ry, rz };
}

function loop(n, fn) {
	for (let i = 0; i < n; i += 1) { fn(i, n); }
}

// Cube
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |  x  | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

function addRect(name = 'cube', { x = .5, y = .5, z = .5 } = {}) {
	W.add(name, {
		vertices: [
		x, y, z,  -x, y, z,  -x,-y, z, // front
		x, y, z,  -x,-y, z,   x,-y, z,
		x, y,-z,   x, y, z,   x,-y, z, // right
		x, y,-z,   x,-y, z,   x,-y,-z,
		x, y,-z,  -x, y,-z,  -x, y, z, // up
		x, y,-z,  -x, y, z,   x, y, z,
		-x, y, z,  -x, y,-z,  -x,-y,-z, // left
		-x, y, z,  -x,-y,-z,  -x,-y, z,
		-x, y,-z,   x, y,-z,   x,-y,-z, // back
		-x, y,-z,   x,-y,-z,  -x,-y,-z,
		x,-y, z,  -x,-y, z,  -x,-y,-z, // down
		x,-y, z,  -x,-y,-z,   x,-y,-z
		],
		uv: [
		1, 1,   0, 1,   0, 0, // front
		1, 1,   0, 0,   1, 0,            
		1, 1,   0, 1,   0, 0, // right
		1, 1,   0, 0,   1, 0, 
		1, 1,   0, 1,   0, 0, // up
		1, 1,   0, 0,   1, 0,
		1, 1,   0, 1,   0, 0, // left
		1, 1,   0, 0,   1, 0,
		1, 1,   0, 1,   0, 0, // back
		1, 1,   0, 0,   1, 0,
		1, 1,   0, 1,   0, 0, // down
		1, 1,   0, 0,   1, 0
		]
	});
}

function getXYCoordinatesFromPolar(angle, r) {
	const x = r * Math.cos(angle);
	const y = r * Math.sin(angle);
	return { x, y };
}

function makeCanvas(id, size) {
	const existingElt = doc.getElementById(id);
	const elt = existingElt || doc.createElement('canvas');
	elt.id = id;
	elt.width = elt.height = size;
	if (!existingElt) doc.querySelector('#loaded').appendChild(elt);
	return [elt, elt.getContext('2d'), size / 2];
}

function makeStarFieldCanvas(id) {
	const size = 800;
	const [cElt, c] = makeCanvas(id, size);
	loop(1000, () => {
		c.rect(gen.int(0, size), gen.int(0, size), 1, 1);
	});
	c.fillStyle = STAR_COLOR;
	c.fill();
	return cElt;
}

function makeStarCanvas({ points = 4, color = '#f00', id, depth = .4, size = 600 } = {}) {
	const [cElt, c, h] = makeCanvas(id, size);
	c.clearRect(0, 0, size, size);
	c.beginPath();
	const angle = TWO_PI / points;
	const line = (a, r) => {
		const { x, y } = getXYCoordinatesFromPolar(a, r);
		c.lineTo(h + x, h + y);
	};
	loop(points, (i) => {
		const a = angle * i;
		line(a, h);
		line(a + (angle / 2), h * depth);
	});
	c.fillStyle = color;
	c.fill();
	return cElt;
}

function setup() {
	const c = doc.getElementById('canvas');
	input.setup({
		lockElt: c,
		keys: {
			Tab: () => input.toggleLock(),
			// w: shipThrust(1)
		}
	});

	c.addEventListener('click', () => {
		input.lock();
	});
	W.reset(c);
	W.clearColor(BG_COLOR);
	// W.camera({ z: 5000 });
	W.light({ x: -1, y: -1.2, z: 0 }); // Set light direction: vector direction x, y, z
	W.ambient(0.5); // Set ambient light's force (between 0 and 1)
	// New shapes
	addRect('ringWall', { y: 10, z: 5 });
	// addRect('rect', { y: 1 });
	// Groups and objects
	W.group({ n: 'system' });
	['sun', 'ring', 'p1', 'p2'].forEach((n) => W.group({ n, g: 'system' }));
	['ship', 'skybox'].forEach((n) => W.group({ n }));

	const sunFlare = makeStarCanvas({ points: 16, color: `${SUN_COLOR}88`, id: 'sun', depth: .7 });

	W.sphere({ n: 'outerSun', g: 'sun', size: 50, b: `${SUN_COLOR}88` });
	W.sphere({ n: 'innerSun', g: 'sun', size: 46, b: SUN_COLOR });
	W.billboard({ n: 'sunFlare', g: 'sun', size: 60, b: SUN_COLOR, t: sunFlare });
	W.sphere({ n: 'planet1', g: 'p1', ...getXYCoordinatesFromPolar(0.5, 300), size: 20, b: P1_COLOR });
	W.sphere({ n: 'planet2', g: 'p2', ...getXYCoordinatesFromPolar(0.7, 400), size: 8, b: P2_COLOR });

	{
		const b = SPACE_COLOR;
		const size = skyboxDist * 2;
		const t = makeStarFieldCanvas('sf');
		[
			{ z: -skyboxDist, b, t }, // : '331122' },
			{ y: -skyboxDist, rx: -90, b, t }, // : '113322' },
			{ y: skyboxDist, rx: 90, b, t }, //: '113322' },
			{ x: -skyboxDist, ry: 90, b, t }, //: '112233' },
			{ x: skyboxDist, ry: -90, b, t }, //: '112233' },
			{ z: skyboxDist, rx: 180, b, t }, //: '331122' },
		].forEach((settings, i) => {
			W.plane({ b: '000', ...settings, n: `skybox${i}`, g: 'skybox', size });
		});
	}
	// W.billboard({ n: 'flare', x: 0, y: 0, z: 0, size: 96, b: '#ff6633' });
	addRect('engine', { x: 0.2, y: 0.2 });
	{
		const b = SHIP_COLOR;
		const g = 'ship';
		W.pyramid({ n: 'shipBase', g, size: shipSize, b });
		W.cube({ n: 'shipCube', g, y: shipSize * -.5, size: shipSize * .8, b });
		// W.cube({ n: 'shipCube2', g, y: shipSize * -.5, size: shipSize * .8, b, mode: 2 });
		W.engine({ n: 'shipEngine1', g, rx: 90, x: -shipSize * .6, y: shipSize * -.7, size: shipSize, b });
		W.engine({ n: 'shipEngine2', g, rx: 90, x: shipSize * .6, y: shipSize * -.7, size: shipSize, b });
	}
	// W.sphere({ n: 'forcefield', g, size: shipSize * 3, b: '77f0' });

	const r = 200;
	const TWO_PI = Math.PI * 2;
	loop(32, (i, n) => {
		const angle = i === 0 ? 0 : (TWO_PI * i) / n;
		const deg = rad2deg(angle);
		// console.log(i, angle, x, y);
		let { x, y } = getXYCoordinatesFromPolar(angle, r);
		const g = `r${i}`;
		W.group({ n: g, g: 'ring' });
		W.ringWall({
			n: `ring${i}`,
			g,
			x,
			y,
			rz: deg,
			size: 2,
			b: RING_COLOR,
		});
		// y += 10;
		W.cube({
			n: `ringBuilding${i}`,
			g,
			x,
			y,
			rz: deg,
			size: 5,
			b: RING_COLOR,
		});
	});
	// Create litter / stardust
	const randCoord = () => gen.rand(-SPACE_SIZE, SPACE_SIZE);
	loop(200, (i) => {
		W.billboard({
			n: `litter${i}`,
			g: 'system',
			x: randCoord(),
			y: randCoord(),
			z: randCoord(),
			size: 1,
			b: '555',
		});
	});
}

function thrust(o, amount = 0) {
	const { x, y, z } = getDirectionUnit(ship).scale(amount);
	o.thrust = { x, y, z};
}

function physics(o, sec) {
	['x', 'y', 'z'].forEach((a) => {
		let force = o.thrust[a] || 0;
		// If no thrust then apply friction (unrealistic in space? let's blame it on lots of star dust)
		if (force === 0) force = -o.vel[a] * VEL_FRICTION;
		const acc = force / (o.mass || 1);
		o.vel[a] = clamp(o.vel[a] + (acc / sec), -MAX_VEL, MAX_VEL);
		if (o.vel[a] < 0.0001 && o.vel[a] > -0.0001) o.vel[a] = 0;
		o[a] = clamp(o[a] + o.vel[a] * sec, -SPACE_SIZE, SPACE_SIZE);
	});
}

function move(things = {}) {
	Object.keys(things).forEach((key) => {
		W.move({ n: key, ...things[key] }, 0);
	});
}

function update() {
	const sec = t / 1000;
	rotation = (rotation + sec) % 360;

	// Handle inputs
	let thrustAmount = input.down.w ? SHIP_THRUST : 0;
	if (input.down.s) thrustAmount = SHIP_THRUST * -.5;
	thrust(ship, thrustAmount);
	if (thrustAmount === 0) {
		W.delete('shipEngineIgnite1');
		W.delete('shipEngineIgnite2');
	} else {
		const t = makeStarCanvas({ points: 10, color: STAR_COLOR, id: 'tf', depth: .3 });
		const base = { g: 'ship', y: shipSize * -1.21, rx: 90, size: .2, b: 'ff0', t };
		W.plane({ ...base, n: 'shipEngineIgnite1', x: -shipSize * .6  });
		W.plane({ ...base, n: 'shipEngineIgnite2', x: shipSize * .6 });
	}
	// if (input.down.a) steer.rz += 1;
	// if (input.down.d) steer.rz -= 1;


	// Do physics
	physicsEnts.forEach((o) => physics(o, sec));
	
	// console.log('z', Math.round(z / 100), '* 100');
	// W.camera({ x: x + camOffset.x, y: y + camOffset.y, z: z + camOffset.z });
	// W.move({ n: 'ship', x, y, z, a: t / 2 }, 0);
	// W.move({ n: 'ship', x: 0, y: 0, z: 0, a: t / 2 }, 0);
	
	const lockMove = input.getLockMove();
	// if (lockMove.x || lockMove.y) console.log(lockMove);
	steer.ry -= lockMove.x / 10;
	steer.rx -= lockMove.y / 10;
	ship.rx = steer.rx;
	ship.ry = steer.ry;
	ship.rz = steer.rz;
	{
		const unit = rotateByDegree(vec3(0, camOffset.back, camOffset.up), steer);
		W.camera({ ...unit, ...addAngles(camOffset, steer), a: 1000 });
	}
	{
		const { x, y, z, rx, ry, rz } = ship;
		W.move({ n: 'ship', rx, ry, rz });
	}
	
	sun.rx += t / 90;
	sun.ry += t / 100;
	move({
		system: { x: -ship.x, y: -ship.y, z: -ship.z, a: t },
		innerSun: { rx: sun.rx, ry: sun.ry },
		p1: { rz: sun.rx * 0.1 },
		p2: { rz: sun.rx * 0.15 },
		ring: { rz: sun.rx * 0.5 },
	});
}

addEventListener('DOMContentLoaded', () => {
	setup();
	setInterval(update, t);
});

window.ship = ship;
window.input = input;

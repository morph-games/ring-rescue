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
	vel: { x: 0, y: 0, z: -16 },
	thrust: { x: 0, y: 0, z: 0 },
	fireCooldown: 0,
	r: 2, // collision radius
	passType: 'ship',
	passthru: ['plasma'],
};
const t = 1000 / 60;
const camOffset = { back: -shipSize * 5, up: shipSize * 1.7, rx: 80, ry: 0, rz: 0 };
let rotation = 0;
const steer = { rx: -90, ry: 0, rz: 0 };
const physicsEnts = [ship];
const renderables = {};
const gen = new RandomGenerator(123);
// https://lospec.com/palette-list/arjibi8
// + https://lospec.com/palette-list/moondrom
const BG_COLOR = '2a242b';
const SHIP_COLOR = '5796a1';
const SHIP_COLOR2 = '8bc7bf';
const RING_COLOR = '5796a1';
const RING_COLOR2 = '478691';
const P1_COLOR = '471b6e';
const P2_COLOR = 'b0455a';
const SUN_COLOR = '#de8b6f'; // 'ff6633'
const STAR_COLOR = '#ebd694';
const SPACE_COLOR = '0000';
const PLASMA_COLOR = '#702782';
// 8bc7bf - light cyan
// 5796a1 - dark cyan
// 524bb3 - blue
// 471b6e - darkest (purple)
// 702782 - purple light
// b0455a - red
// de8b6f - orange
// ebd694 - yellow
const textures = {};
const achievements = [
	'Check steering: [Tab] to toggle mouse-lock'
].map((t) => ({ t, done: 0 }));

function rad2deg(rad) { return rad * (180/PI); }
function deg2rad(deg) { return deg * (PI/180); }
function uid() { return String(Number(new Date())); }
// Some functions here from LittleJS utilities
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }

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
	textures.tf = makeStarCanvas({ points: 9, color: STAR_COLOR, id: 'tf', depth: .3 });
	textures.plasma = makeStarCanvas({ points: 11, color: PLASMA_COLOR, id: 'plasma', depth: .2 });
	 

	c.addEventListener('click', () => {
		input.lock();
	});
	W.reset(c);
	W.clearColor(BG_COLOR);
	// W.camera({ z: 5000 });
	W.light({ x: -1, y: -1.2, z: 0 }); // Set light direction: vector direction x, y, z
	W.ambient(0.8); // Set ambient light's force (between 0 and 1)
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
		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: -shipSize * .6, y: shipSize * -.7, size: shipSize, b: SHIP_COLOR2 };
		W.engine(eng);
		W.engine({ ...eng, n: 'shipEngine2', x: -eng.x });
		W.cube({ n: 'shipEngineBack1', g,  x: -shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
		W.cube({ n: 'shipEngineBack2', g,  x: shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
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
			b: RING_COLOR2,
		});
	});
	// Create litter / stardust
	const randCoord = () => gen.rand(-SPACE_SIZE, SPACE_SIZE);
	const randCoords = () => ({
		x: randCoord(),
		y: randCoord(),
		z: randCoord(),
	});
	loop(200, (i) => {
		W.billboard({
			n: `litter${i}`,
			g: 'system',
			...randCoords(),
			size: 1,
			b: '555',
		});
	});
	// Create physical crates
	loop(50, (i) => {
		const crate = {
			n: `crate${i}`,
			passType: 'crate',
			passthru: ['crate'],
			g: 'system',
			...randCoords(),
			vel: { ...vec3() },
			size: 3,
			r: 2, // collision radius
			b: 'de8b6f',
			rx: rand(0, 359),
			ry: rand(0, 359),
			rz: rand(0, 359),
			hp: 3,
		};
		physicsEnts.push(crate);
		renderables[crate.n] = crate;
		W.cube(crate);
	});
}

function thrust(o, amount = 0) {
	const { x, y, z } = getDirectionUnit(ship).scale(amount);
	o.thrust = { x, y, z};
}

function physics(o, sec) {
	['x', 'y', 'z'].forEach((a) => {
		let force = (o.thrust) ? o.thrust[a] || 0 : 0;
		// If no thrust then apply friction (unrealistic in space? let's blame it on lots of star dust)
		if (force === 0 && o.friction !== 0) force = -o.vel[a] * VEL_FRICTION;
		const acc = force / (o.mass || 1);
		o.vel[a] = clamp(o.vel[a] + (acc / sec), -MAX_VEL, MAX_VEL);
		if (o.vel[a] < 0.0001 && o.vel[a] > -0.0001) o.vel[a] = 0;
		o[a] = clamp(o[a] + o.vel[a] * sec, -SPACE_SIZE, SPACE_SIZE);
	});
}

function dmg(a, b) {
	if (a.damage && b.hp) {
		b.hp -= a.damage;
		a.decay = 0;
		if (b.hp <= 0) b.decay = 0;
	}
};

function collide(e1, e2, dist) {
	// console.log('collide!', e1.n, e2.n);
	// Set flags
	e1.collided = e2;
	e2.collided = e1;
	// Damage
	dmg(e1, e2);
	dmg(e2, e1);
	// Un-overlap
	const collisionVector = vec3(e2).sub(e1).normalize();
	const overlap = e1.r + e2.r - dist;
	// Move each sphere back by half the overlap
	const reverseOverlapVector = collisionVector.scale(overlap / 2);
	vec3(e1).sub(reverseOverlapVector).copyTo(e1);
	vec3(e2).add(reverseOverlapVector).copyTo(e2);
	// Set new velocities
	['x', 'y', 'z'].forEach((a) => {
		const m1 = e1.mass || 1;
		const m2 = e2.mass || 1;
		const tm = m1 + m2;
		const v1 = e1.vel[a];
		const v2 = e2.vel[a];
		// From https://en.wikipedia.org/wiki/Elastic_collision#Equations
		e1.vel[a] = (
			((m1 - m2) / tm) * v1
			+ ((2 * m2) / tm) * v2
		) * 1; // restitution
		e2.vel[a] = (
			((2 * m1) / tm) * v1
			+ ((m2 - m1) / tm) * v2
		) * 1;
		// console.log(a, 'before', v1, v2, '\nafter', e1.vel[a], e2.vel[a]);
	});
}

function checkCollisions(ents) {
	loop(ents.length, (i) => {
		checkCollisionOne(ents[i], ents);
	});
}

function pass(a, b) {
	return (a.passthru && a.passthru.includes(b.passType));
}

function checkCollisionOne(e1, ents) {
	if (e1.collided) return;
	loop(ents.length, (w) => {
		const e2 = ents[w];
		if (pass(e1, e2) || pass(e2, e1) || e1 === e2)  return;
		if (e2.collided) return;
		const d = vec3(e1).distance(e2);
		if (d <= (e1.r + e2.r)) collide(e1, e2, d);
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
		const base = { g: 'ship', y: shipSize * -1.31, rx: 90, size: .2, t: textures.tf };
		W.plane({ ...base, n: 'shipEngineIgnite1', x: -shipSize * .6  });
		W.plane({ ...base, n: 'shipEngineIgnite2', x: shipSize * .6 });
	}
	const click = input.getClick();
	if (ship.fireCooldown === 0 && (
		input.down[' '] || (click && click.left && click.locked)
	)) {
		const { x, y, z } = ship;
		const u = getDirectionUnit(ship);
		const v = u.scale(30).add(ship.vel); // scale 26 works well with thrust scale 0.1
		const plasma = {
			n: 'plasma' + uid(),
			g: 'system',
			passType: 'plasma',
			x, y, z,
			vel: { ...v }, // TODO: add velocity in
			thrust: { ...u.scale(0.0005) },
			friction: 0,
			decay: 4,
			damage: 1,
			r: 0.5,
			passthru: ['ship', 'plasma'],
			mass: 0.01,
		};
		physicsEnts.push(plasma);
		renderables[plasma.n] = plasma;
		W.billboard({ ...plasma, size: 1, t: textures.plasma });
		ship.fireCooldown = 0.3;
	}

	// collide(physicsEnts);
	checkCollisions(physicsEnts);
	// Do physics, and clear collided flag
	physicsEnts.forEach((o) => {
		o.collided = 0;
		physics(o, sec);
	});
	
	// console.log('z', Math.round(z / 100), '* 100');
	// W.camera({ x: x + camOffset.x, y: y + camOffset.y, z: z + camOffset.z });
	// W.move({ n: 'ship', x, y, z, a: t / 2 }, 0);
	// W.move({ n: 'ship', x: 0, y: 0, z: 0, a: t / 2 }, 0);
	
	const lockMove = input.getLockMove();
	// if (lockMove.x || lockMove.y) console.log(lockMove);
	steer.ry -= lockMove.x / 10;
	steer.rx -= lockMove.y / 10;
	['rx', 'ry', 'rz'].forEach((k) => ship[k] = lerp(0.1, ship[k], steer[k]));
	{
		const unit = rotateByDegree(vec3(0, camOffset.back, camOffset.up), steer);
		W.camera({ ...unit, ...addAngles(camOffset, steer), a: 1000 });
	}
	{
		const { x, y, z, rx, ry, rz } = ship;
		W.move({ n: 'ship', rx, ry, rz });
	}
	// cool down
	ship.fireCooldown = Math.max(ship.fireCooldown - sec, 0);

	// Decay
	Object.keys(renderables).forEach((k) => {
		const p = renderables[k];
		if (typeof p.decay === 'number') {
			p.decay -= sec;
			if (p.decay <= 0) {
				// console.log('decay', p.n);
				W.delete(p.n);
				delete renderables[k];
				const i = physicsEnts.findIndex((e) => e.n === p.n);
				physicsEnts.splice(i, 1);
			}
		}
	});


	// Animate the system
	sun.rx += t / 90;
	sun.ry += t / 100;
	move({
		...renderables,
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

window.g = {
	renderables,
	ship,
	input,
	physicsEnts,
};

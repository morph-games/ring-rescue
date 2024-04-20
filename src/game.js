import W from './w.esm.js';
import input from './input.js';
import { vec3, rad2deg, deg2rad } from './Vector3.js';
import RandomGenerator from './RandomGenerator.js';
import { addRect } from './w-tools.js';
// const { W } = window;

const { min, max, PI } = Math;

// Note that max distance is 1000
// So world can be -500 --> 500 in any dimensions
// Solar system is 30 trillion km diameter
// so if the scale matches, then each 1.0 unit = 30 billion km
const MAX_VEL = 1000;
const SPACE_SIZE = 499;
const skyboxDist = SPACE_SIZE;
const TWO_PI = PI * 2;
const VEL_FRICTION = 1 / 10000;
const SHIP_THRUST = 0.01;
const KLAX_THRUST = 0.003;
const KLAX_COUNT = 2;

const doc = document;

const shipSize = 0.3;
const sun = { rx: 0, ry: 0, ry: 0 };
const ship = {
	x: 0, y: 0, z: SPACE_SIZE - 10,
	rx: -90, ry: 0, rz: 0,
	vel: { x: 0, y: 0, z: 0 },
	thrust: { x: 0, y: 0, z: 0 },
	fireCooldown: 0,
	r: 2, // collision radius
	passType: 'ship',
	passthru: ['plasma'],
	shieldOpacity: 0,
	sight: 700,
	aggro: 0,
	thrustCooldown: 0,
	hp: 5,
	facing: { x: 0, y: 1, z: 0 },
};
const klaxShip = {
	...structuredClone(ship),
	passType: 'klaxShip',
	passthru: ['klaxPlasma'],
	facing: { x: 1, y: 0, z: 0 },
};
const klaxShips = [];
const t = 1000 / 60;
const camOffset = { back: -shipSize * 5, up: shipSize * 1.7, rx: 80, ry: 0, rz: 0 };
let fov = 30;
let rotation = 0;
const steer = { rx: -90, ry: 0, rz: 0 };
const physicsEnts = [ship];
const renderables = {};
const seed = 1234;
const gen = new RandomGenerator(seed);

// + https://lospec.com/palette-list/moondrom
const BG_COLOR = '2a242b';
const SHIP_COLOR = '5796a1';
const SHIP_COLOR2 = '8bc7bf';
const RING_COLOR = '5796a1';
const RING_COLOR2 = '478691';
const P1_COLOR = '775b5b';
const P2_COLOR = 'b0455a';
const SUN_COLOR = '#de8b6f'; // 'ff6633'
const STAR_COLOR = '#ebd694';
const SPACE_COLOR = '0000';
const PLASMA_COLOR1 = '#de8b6f';
const PLASMA_COLOR2 = '#b0455a';
const PLASMA_COLOR3 = '#90d59c';
const KSHIP_COLOR1 = '471b6e';
const KSHIP_COLOR2 = '372b4e';
const KSHIP_COLOR3 = '90d59c';
// https://lospec.com/palette-list/arjibi8
// 8bc7bf - light cyan
// 5796a1 - dark cyan
// 524bb3 - blue
// 471b6e - darkest (purple)
// 702782 - purple light
// b0455a - red
// de8b6f - orange
// ebd694 - yellow
// https://lospec.com/palette-list/moondrom
// 2a242b - dark gray
// 90d59c - green
const textures = {};
const achievements = [
	'Check steering: [Tab] to toggle mouse-lock',
	'Thrusters: [W]',
	'Fire weapons: [Space] or [Click]',
].map((t) => ({ t, done: 0 }));

function uid() { return String(Number(new Date())); }
// Some functions here from LittleJS utilities
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }

const randCoord = () => gen.rand(-SPACE_SIZE, SPACE_SIZE);
const randCoords = () => ({
	x: randCoord(),
	y: randCoord(),
	z: randCoord(),
});

function rotateByDegree(v, o) {
	return v.rotate(deg2rad(o.rx), deg2rad(o.ry), deg2rad(o.rz));
}
function getDirectionUnit(o) {
	const { facing } = o;
	return rotateByDegree(vec3(facing), o);
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
const $id = (id) => doc.getElementById(id);

function achieve(i) {
	if (achievements[i].done) return;
	achievements[i].done = 1;
	updateAchievements();
}

function updateAchievements() {
	$id('goals').innerHTML = achievements.map(
		({ t, done }) => `<li class="${ done ? 'done' : ''}">${t}</li>`,
	).join('');
}

function getXYCoordinatesFromPolar(angle, r) {
	const x = r * Math.cos(angle);
	const y = r * Math.sin(angle);
	return { x, y };
}

function makeCanvas(id, size) {
	const existingElt = $id(id);
	const elt = existingElt || doc.createElement('canvas');
	elt.id = id;
	elt.width = elt.height = size;
	if (!existingElt) $id('loaded').appendChild(elt);
	return [elt, elt.getContext('2d'), size / 2];
}

function makeStarFieldCanvas(id) {
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

function addAxisCubes(g, size) {
	W.cube({ n: g + 'axisX', g, x: size + 1, size, b: 'a008' });
	W.cube({ n: g + 'axisY', g, y: size + 1, size, b: '0a08' });
	W.cube({ n: g + 'axisZ', g, z: size + 1, size, b: '00a8' });
}

function makeKlaxShip(i) {
	const n = `k${i}`;
	const b = KSHIP_COLOR1;
	const pos = randCoords();
	// const pos = { x: 0, y: 0, z: 100 };

	// const { rx, ry, rz } = vec3().toWAngles(vec3(ship));
	const k = {
		n,
		...structuredClone(klaxShip),
		...pos, size: 5, r: 5,
		// rx, ry, rz,
	};
	// console.log(k);
	W.group({ n, g: 'system', ...pos,
		// rx, ry, rz,
	});
	const g = n;
	const core = { g, size: 2.5, x: -1.5, b: KSHIP_COLOR2 };
	const strut = { g, size: 2, b: KSHIP_COLOR1 };
	W.cube({ ...core, n: n + 'c', rx: 45, b: KSHIP_COLOR1 });
	loop(4, (i) => {
		W.cube({ ...core, n: `${n}cc${i}`, x: -2 - i, size: 2.5 - (0.5 * i),
			// rx: 45 + (i * 45),
		});
		// W.cube({ ...core, n: `${n}c${i}`, x: -2 - i, y: rand(-1, 1), z: rand(-1, 1), size: rand(2, 3),
		// 	rx: rand(-10, 10), ry: rand(-10, 10), b: KSHIP_COLOR2 });
	});
	W.pyramid({ n: n + 'nose', rz: -90, g, size: 1.5, b: KSHIP_COLOR3 });
	
	W.longRect({ ...strut, n: n + 'wing1', y: 2, rx: 90, ry: 45, rz: -45, });
	W.longRect({ ...strut, n: n + 'wing2', y: 2, x: 1.5, rx: 90, ry: 45, rz: 45, b });
	W.longRect({ ...strut, n: n + 'wing3', y: -2, rx: 90, ry: 45, rz: 45, });
	W.longRect({ ...strut, n: n + 'wing4', y: -2, x: 1.5, rx: 90, ry: 45, rz: -45, b });
	W.sphere({ n: n + 'shield', g, size: 10, b: 'ebd69403' });
	// addAxisCubes(g, 4);
	
	physicsEnts.push(k);
	renderables[k.n] = k;
	klaxShips.push(k);
}


function setup() {
	const c = $id('canvas');
	input.setup({
		lockElt: c,
		keys: {
			Tab: () => { achieve(0); input.toggleLock(); },
			// w: shipThrust(1)
		}
	});
	textures.tf = makeStarCanvas(9, STAR_COLOR, 'tf', .3);
	textures.plasma = makeStarCanvas(11, PLASMA_COLOR1, 'plasma', .2);
	textures.photon = makeStarCanvas(13, PLASMA_COLOR2, 'photon', .5);
	textures.klaxPlasma = makeStarCanvas(15, PLASMA_COLOR3, 'klaxPlasma', .3);
	 

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
	addRect('longRect', { x: 0.2, y: 0.2 });
	// addRect('rect', { y: 1 });

	// Groups and objects
	W.group({ n: 'system' });
	['sun', 'ring', 'p1', 'p2'].forEach((n) => W.group({ n, g: 'system' }));
	['ship', 'skybox'].forEach((n) => W.group({ n })); // Are not in a group

	const sunFlare = makeStarCanvas(16, `${SUN_COLOR}88`, 'sun', .7);

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
			{ z: -skyboxDist, b, t },
			{ y: -skyboxDist, rx: -90, b, t },
			{ y: skyboxDist, rx: 90, b, t },
			{ x: -skyboxDist, ry: 90, b, t },
			{ x: skyboxDist, ry: -90, b, t },
			{ z: skyboxDist, rx: 180, b, t },
		].forEach((settings, i) => {
			W.plane({ b: '000', ...settings, n: `skybox${i}`, g: 'skybox', size });
		});
	}
	// W.billboard({ n: 'flare', x: 0, y: 0, z: 0, size: 96, b: '#ff6633' });
	{
		const b = SHIP_COLOR;
		const g = 'ship';
		W.pyramid({ n: 'shipBase', g, size: shipSize, b });
		W.cube({ n: 'shipCube', g, y: shipSize * -.5, size: shipSize * .8, b });
		// W.cube({ n: 'shipCube2', g, y: shipSize * -.5, size: shipSize * .8, b, mode: 2 });
		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: -shipSize * .6, y: shipSize * -.7, size: shipSize, b: SHIP_COLOR2 };
		W.longRect(eng);
		W.longRect({ ...eng, n: 'shipEngine2', x: -eng.x });
		W.cube({ n: 'shipEngineBack1', g,  x: -shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
		W.cube({ n: 'shipEngineBack2', g,  x: shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
		// W.sphere({ n: 'forcefield', g, size: shipSize * 3, b: '77f0' });
		// addAxisCubes(g, 1);
	}
	
	loop(KLAX_COUNT, makeKlaxShip);

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
	loop(200, (i) => {
		W.billboard({
			n: `litter${i}`,
			g: 'system',
			...randCoords(),
			size: 1,
			b: '555e',
		});
	});
	// Create physical crates
	loop(30, (i) => {
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
	updateAchievements();
}

function thrust(o, amount = 0) {
	const { x, y, z } = getDirectionUnit(o).scale(amount);
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
	a.aggro += 1;
	b.aggro += 1;
	a.shieldOpacity += 5;
	b.shieldOpacity += 5;
};

function collide(e1, e2, dist) {
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

function cool(o, prop, sec) {
	o[prop] = max(o[prop] - sec, 0);
}

function steerRotation(o, steer, amount = 0.01) {
	['rx', 'ry', 'rz'].forEach((k) => o[k] = lerp(amount, o[k], steer[k]));
}

function updateShip(k, sec) {
	if (k.decay <= 0 || k.hp <= 0) {
		// console.warn('destroyed ship');
		return;
	}
	const pos = vec3(k);
	const dist = pos.distance(ship);
	if (dist > k.sight * 2) k.aggro = max(0, k.aggro -= 0.1);
	else if (dist <= k.sight) k.aggro = max(1, k.aggro);
	if (!k.aggro) return;
	// Aggro actions
	const steer = pos.toWAngles(ship);
	steerRotation(k, steer, 0.02);
	// k.rx = lerp(0.01, k.rx, rx);
	// k.ry = lerp(0.01, k.ry, ry);
	// k.rz = lerp(0.01, k.rz, rz);
	if (k.thrustCooldown) {
		cool(k, 'thrustCooldown', sec);
	} else {
		thrust(k, KLAX_THRUST);
		k.thrustCooldown = rand(1, 5);
	}
	if (k.fireCooldown) {
		cool(k, 'fireCooldown', sec);
	} else {
		spawnPlasma('klaxPlasma', k, 'klaxPlasma', ['klaxShip', 'klaxPlasma']);
		k.fireCooldown = rand(0.3, 3);
	}
}

const PROJECTILE_TYPES = {
	plasma: { vScale: 25, tScale: 0.0005, damage: 1, size: 1 },
	photon: { vScale: 15, tScale: 0.0001, damage: 3, size: 1 },
	klaxPlasma: { vScale: 25, tScale: 0.0005, damage: 1, size: 10 },
};

function spawnPlasma(typeKey, from, passType, passthru) {
	const { vScale, tScale, damage, size } = PROJECTILE_TYPES[typeKey];
	const t = textures[typeKey];
	const { x, y, z } = from;
	const u = getDirectionUnit(from);
	const v = u.scale(vScale).add(from.vel);
	const plasma = {
		n: typeKey + passType + uid(),
		g: 'system',
		passType,
		x, y, z,
		vel: { ...v },
		thrust: { ...u.scale(tScale) },
		friction: 0,
		decay: 5,
		damage,
		r: 0.5,
		passthru,
		mass: 0.01,
	};
	physicsEnts.push(plasma);
	renderables[plasma.n] = plasma;
	W.billboard({ ...plasma, size, t });
}

function update() {
	const sec = t / 1000;
	rotation = (rotation + sec) % 360;

	// Handle inputs and update player ship
	const { down } = input;
	if (down[']']) fov += .5;
	if (down['[']) fov -= .5;
	if (down.p) return;
	let thrustAmount = down.w ? SHIP_THRUST : 0;
	if (down.s) thrustAmount = SHIP_THRUST * -.5;
	thrust(ship, thrustAmount);
	if (thrustAmount === 0) {
		W.delete('shipEngineIgnite1');
		W.delete('shipEngineIgnite2');
	} else {
		achieve(1);
		const base = { g: 'ship', y: shipSize * -1.31, rx: 90, size: .2, t: textures.tf };
		W.billboard({ ...base, n: 'shipEngineIgnite1', x: -shipSize * .6  });
		W.billboard({ ...base, n: 'shipEngineIgnite2', x: shipSize * .6 });
	}
	const click = input.getClick();
	if (ship.fireCooldown === 0 && (
		down[' '] || (click && click.locked)
	)) {
		achieve(2);
		spawnPlasma((click && click.right) ? 'photon' : 'plasma', ship, 'plasma', ['ship', 'plasma']);
		ship.fireCooldown = 0.3;
	}
	// Player cool down
	ship.fireCooldown = max(ship.fireCooldown - sec, 0);

	// Do enemy thrust, rotation, cooldowns, and AI
	klaxShips.forEach((k) => updateShip(k, sec));

	// Do collisions
	checkCollisions(physicsEnts);
	// Do physics, and clear collided flag
	physicsEnts.forEach((o) => {
		o.collided = 0;
		physics(o, sec);
	});
	
	// Do steering
	const lockMove = input.getLockMove();
	// if (lockMove.x || lockMove.y) console.log(lockMove);
	steer.ry -= lockMove.x / 10;
	steer.rx -= lockMove.y / 10;
	steerRotation(ship, steer, 0.05);
	{
		const unit = rotateByDegree(vec3(0, camOffset.back, camOffset.up), steer);
		W.camera({ ...unit, ...addAngles(camOffset, steer), a: 1000, fov });
	}
	{
		const { x, y, z, rx, ry, rz } = ship;
		W.move({ n: 'ship', rx, ry, rz });
	}

	// Decay
	Object.keys(renderables).forEach((k) => {
		const p = renderables[k];
		if (typeof p.decay === 'number') {
			p.decay -= sec;
			if (p.decay <= 0) {
				console.log('decay', p.n);
				W.delete(p.n);
				delete renderables[k];
				const i = physicsEnts.findIndex((e) => e.n === p.n);
				if (i !== -1) physicsEnts.splice(i, 1);
			}
		}
	});

	// Animate the system and renderables
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

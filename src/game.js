import W from './w.custom.esm.js';
import input from './input.js';
import { makeStarSystem } from './star-system.js';
import { BG_COLOR, FLAME_ON_COLOR, FLAME_OFF_COLOR,
} from './colors.js';
import { vec3 } from './Vector3.js';
import { addPyramid, addRect, addSphere } from './w-shapes.js';
import { makeTextures } from './textures.js';
import { zzfx } from 'zzfx';
import { $id, $html } from './dom.js';
import { SHIP_SIZE, FAR, SPACE_SIZE } from './scale.js';
import { getDirectionUnit, loop, clamp, lerp, rotateByDegree, addAngles, uid, rand } from './utils.js';

const { min, max, PI, round, abs } = Math;

let sys;
let textures = {};
let parts = 0;
const MAX_PARTS = 5;
const MAX_VEL = 3000;
const VEL_FRICTION = 1 / 12000;

const sun = { rx: 0, ry: 0, ry: 0 };

const t = 1000 / 60;
const camOffset = { back: -SHIP_SIZE * 5, up: SHIP_SIZE * 2, rx: 80, ry: 0, rz: 0 };
const cam = { fov: 30, targetFov: 30, lastFov: 31, aspect: 1, near: 0.5, far: FAR };
let rotation = 0;
const STEER_X_MIN = -90 - 90;
const STEER_X_MAX = -90 + 90;
const steer = { rx: -90, ry: 0, rz: 0 };

const achievements = [
	'Check steering: [Tab] to toggle mouse-lock',
	'Thrusters: [W]',
	'Fire weapons: [Space] or [Click]',
].map((t) => ({ t, done: 0 }));

function achieve(i) {
	if (achievements[i].done) return;
	achievements[i].done = 1;
	updateAchievements();
}

function updateAchievements() {
	const kills = sys.klaxShips.reduce((sum, k) => sum + (k.hp > 0 ? 0 : 1), 0);
	const html = achievements.map(
		({ t, done }) => `<li class="${ done ? 'done' : ''}">${t}</li>`,
	).join('')
		+ `<li>Klaxonian Ships Destroyed: ${kills} / ${sys.klaxShips.length}</li>`
		+ `<li>Ring Repair Parts: ${parts} / ${MAX_PARTS}</li>`;
	$html('goals', html);
}

function setupCanvasSize(c) {
	const w = c.clientWidth;
	const h = c.clientHeight
	if (w > h) {
		cam.aspect = w/h;
		c.height = min(w, 800);
		c.width = w / cam.aspect;
	} else {
		// Make it square
		c.width = c.height = min(w, 800);
		cam.aspect = 1;
	}
	// const minDim = max(min(ogW, ogH), 800);
	// const aspect = ogW / ogH;
	// c.width = minDim * aspect;
	// c.height = minDim * aspect;
	// console.log(aspect, ogW, ogH, c.width, c.height);
	// cam.aspect = aspect;
}


function setup() {
	const c = $id('canvas');
	setupCanvasSize(c);
	input.setup({
		lockElt: c,
		keys: {
			Tab: () => { achieve(0); input.toggleLock(); },
			// w: shipThrust(1)
		}
	});
	textures = makeTextures();

	c.addEventListener('click', () => {
		input.lock();
	});
	W.reset(c);
	W.clearColor(BG_COLOR);
	// W.camera({ z: 5000 });
	W.light({ x: -1, y: -1.2, z: .2 }); // Set light direction: vector direction x, y, z
	W.ambient(0.8); // Set ambient light's force (between 0 and 1)
	// New shapes
	addRect('plank', { y: 10, z: 5, x: .3 });
	addRect('longRect', { x: 0.2, y: 0.2 });
	addRect('longerRect', { x: 0.2, y: 0.2, z: .7 });
	addRect('cube');
	addPyramid('pyramid');
	addPyramid('longPyramid', { y: .8 });
	addSphere('sphere');
	addSphere('ufo', { y: 3, precision: 10 });
	// addRect('rect', { y: 1 });

	sys = makeStarSystem(W, SPACE_SIZE);
	['renderables', 'ship', 'physicsEnts', 'klaxShips'].forEach((k) => {
		window[k] = sys[k];
		g[k] = sys[k];
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
		const isShipHurt = (b === ship)
		b.hp -= a.damage;
		// a.decay = 0;
		if (b.hp <= 0) {
			b.decay = 0;
			if (!isShipHurt) updateAchievements();
		}
		const vol = isShipHurt ? 1.1 : .5;
		zzfx(...[vol,,416,.02,.21,.52,4,2.14,.2,,,,,1.7,,.9,,.44,.12,.23]);
		if (isShipHurt) flashBorder('canvas');
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
		thrust(k, k.thrustForce);
		k.thrustCooldown = rand(.5, 3);
	}
	if (k.fireCooldown) {
		cool(k, 'fireCooldown', sec);
	} else {
		spawnPlasma('klaxPlasma', k, 'klaxPlasma', ['klaxShip', 'klaxPlasma']);
		k.fireCooldown = rand(0.3, 3);
	}
}

const PROJECTILE_TYPES = {
	plasma: { vScale: 25, tScale: 0.0005, damage: 1, size: 1,
		sound: [,.1,295,.02,.01,.08,,1.72,-3.5,.2,,,,.2,,,.08,.62,.09] },
	photon: { vScale: 15, tScale: 0.0001, damage: 3, size: 1,
		sound: [2.06,.35,212,.05,.08,.01,,1.66,-4.8,.2,50,,,1.7,,.5,.28,.65,.02] },
	klaxPlasma: { vScale: 25, tScale: 0.0005, damage: 1, size: 10,
		sound: [.3,.4,241,.04,.03,.08,,.46,-7.7,,,,,,,.2,,.53,.05,.2],
	},
};

function spawnPlasma(typeKey, from, passType, passthru) {
	const { vScale, tScale, damage, size, sound } = PROJECTILE_TYPES[typeKey];
	const t = textures[typeKey];
	const { x, y, z } = from;
	const u = getDirectionUnit(from);
	const v = u.scale(vScale).add(from.vel);
	zzfx(...sound);
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
		r: 5,
		passthru,
		mass: 0.01,
	};
	physicsEnts.push(plasma);
	renderables[plasma.n] = plasma;
	W.billboard({ ...plasma, size, t });
}

function updateUI() {
	const v = vec3(ship.vel);
	const dir = (v.x > v.y && v.x > v.z) ? 'X' : (
		(v.y > v.x && v.y > v.z) ? 'Y' : 'Z'
	);
	const html = '<b>' + [
		`Velocity: ${round(v.length())} (${dir})`,
		`Pitch: ${round(steer.rx + 90)}, Yaw: ${round(steer.ry) % 360}`,
		`Hull: ${ship.hp}`,
	].join('</b><b>') + '</b>';
	$html('si', html);
}

function update() {
	const sec = t / 1000;
	rotation = (rotation + sec) % 360;

	// Handle inputs and update player ship
	const { down } = input;
	if (down[']']) cam.targetFov += .5;
	if (down['[']) cam.targetFov -= .5;
	if (down.p) return;
	const boost = down.Shift ? 2 : 1;
	let thrustAmount = 0; 
	if (down.s || down.S) {
		thrustAmount = ship.thrustForce * boost * -.5;
		down.w = false;
		down.W = false;
	} else if (down.w || down.W) {
		thrustAmount = ship.thrustForce * boost;
	}
	thrust(ship, thrustAmount);
	const flameColor = (thrustAmount > 0) ? FLAME_ON_COLOR : FLAME_OFF_COLOR;
	W.move({ n: 'sFlame1', b: flameColor });
	W.move({ n: 'sFlame2', b: flameColor });
	if (thrustAmount === 0) {
		W.delete('sIgnite1');
		W.delete('sIgnite2');
	} else {
		const vol = (boost > 1) ? .15 : .1;
		const bitCrush = (boost > 1) ? .2 : .8;
		zzfx(...[vol,,794,.02,.3,.32,,3.96,,.7,,,.16,2.1,,bitCrush,.1,.31,.27]);
		achieve(1);
		const base = { g: 'ship', y: SHIP_SIZE * -1.31, rx: 70, size: .2, t: textures.tf };
		W.billboard({ ...base, n: 'sIgnite1', x: -SHIP_SIZE * 1.1  });
		W.billboard({ ...base, n: 'sIgnite2', x: SHIP_SIZE * 1.1 });
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
	{
		const { ry, rx } = steer;
		const lockMove = input.getLockMove();
		// if (lockMove.x || lockMove.y) console.log(lockMove);
		steer.ry -= lockMove.x / 10;
		steer.rx = min(max(steer.rx - lockMove.y / 10, STEER_X_MIN), STEER_X_MAX);
		// steer.rz += down.a ? -2 : (down.d ? 2 : 0);
		// console.log({ ...steer });
		steerRotation(ship, steer, 0.05);
	}
	{
		const unit = rotateByDegree(vec3(0, camOffset.back, camOffset.up), steer);
		// TODO: only add cam if fov or aspect ratio has changed
		const speedFov = (!thrustAmount) ? 0 : (
			thrustAmount < 0 ? -2 : (
				(boost > 1) ? 10 : 1
			)
		);
		cam.fov = lerp(0.1, cam.fov, cam.targetFov + speedFov);
		const fovChanged = abs(cam.fov - cam.lastFov) > 0.001;
		cam.lastFov = cam.fov;
		let camSettings = { ...unit, ...addAngles(camOffset, steer), a: 100 };
		if (fovChanged) camSettings = { ...camSettings, ...cam };
		W.camera(camSettings);
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
				// console.log('decay', p.n);
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
		p3: { rz: sun.rx * 0.05 },
		ring: { rz: sun.rx * 0.5 },
	});
	updateUI();
}

addEventListener('DOMContentLoaded', () => {
	setup();
	setInterval(update, t);
});

window.g = {
	input,
};

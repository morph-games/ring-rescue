import { makeStarCanvas, makeStarFieldCanvas, makeRabbit, makeHopArmor } from './textures.js';
import { getXYCoordinatesFromPolar, loop, rand, pick } from './utils.js';
import { vec3, rad2deg } from './Vector3.js';
import { SUN_COLOR, P1_COLOR, P2_COLOR, SPACE_COLOR, SHIP_COLOR, SHIP_COLOR2,
	FLAME_OFF_COLOR, KSHIP_COLOR1, KSHIP_COLOR2, KSHIP_COLOR3, RING_COLOR,
	RING_COLOR2,
} from './colors.js';
import { SHIP_SIZE, RING_RADIUS, SPACE_SIZE } from './scale.js';
import RandomGenerator from './RandomGenerator.js';

let W;
let spin = 0;

const PHYSICS_COLLIDABLE = 1;
const KLAX_COUNT = 6;
const seed = 1234;
const gen = new RandomGenerator(seed);

const randCoord = (n = SPACE_SIZE) => gen.rand(-n, n);
const randCoords = (n) => ({
	x: randCoord(n),
	y: randCoord(n),
	z: randCoord(n),
});

// function addAxisCubes(g, size) {
// 	W.cube({ n: g + 'axisX', g, x: size + 1, size, b: 'a008' });
// 	W.cube({ n: g + 'axisY', g, y: size + 1, size, b: '0a08' });
// 	W.cube({ n: g + 'axisZ', g, z: size + 1, size, b: '00a8' });
// }

const ship = {
	x: 0, y: 0, z: SPACE_SIZE * .5,
	rx: -90, ry: 0, rz: 0,
	vel: { x: 0, y: 0, z: 0 },
	thrust: { x: 0, y: 0, z: 0 },
	thrustForce: 0.06,
	fireCooldown: 0,
	r: 2, // collision radius
	passType: 'ship',
	passthru: ['plasma'],
	sight: 1500,
	aggro: 0,
	thrustCooldown: 0,
	trailCooldown: 0,
	hp: 9,
	maxHp: 9,
	power: 100,
	maxPower: 100,
	recharge: .2,
	weaponPowerUsage: 6,
	shieldPower: 100,
	enginePowerUsage: .4,
	shields: 0,
	shieldsDecayAmount: .4,
	p: PHYSICS_COLLIDABLE, // is a physics object
	ignition: 0, // size of ignite billboard
	ignitionSize: .2,
	facing: { x: 0, y: 1, z: 0 },
	inv: { parts: 0 },
	steerPercent: 0.05,
	explodes: { colors: ['464040', '5796a1'], size: 1, count: 16 },
};
const klaxShip = {
	...structuredClone(ship),
	thrustForce: 0.008,
	hp: 5,
	passType: 'klaxShip',
	passthru: ['klaxPlasma'],
	facing: { x: 1, y: 0, z: 0 },
	drops: ['parts'],
	explodes: { colors: ['464040', '702782'], size: 5, count: 16 },
	isKlax: 1,
};
const renderables = {};

function makeKlaxShip(i) {
	const n = `k${i}`;
	const b = KSHIP_COLOR1;
	const pos = randCoords(RING_RADIUS);
	// const pos = { x: 0, y: 0, z: 6000 };
	const size = 5;
	const coreSize = size / 2;
	const strutSize = size / 2.5;
	const k = {
		n,
		...structuredClone(klaxShip),
		...pos, size: 5, r: 10,
		isGroup: 1, // Identify this as a group in renderables
	};
	// console.log(k);
	W.group({ n, g: 'system', ...pos });
	const g = n;
	const core = { g, size: coreSize, x: -1.5, b: KSHIP_COLOR2 };
	const strut = { g, size: strutSize, b: KSHIP_COLOR1 };
	W.cube({ ...core, n: n + 'c', rx: 45, b: KSHIP_COLOR1 });
	loop(4, (i) => {
		W.cube({ ...core, n: `${n}cc${i}`, x: -2 - i, size: 2.5 - (0.5 * i),
			// rx: 45 + (i * 45),
		});
		// W.cube({ ...core, n: `${n}c${i}`, x: -2 - i, y: rand(-1, 1), z: rand(-1, 1), size: rand(2, 3),
		// 	rx: rand(-10, 10), ry: rand(-10, 10), b: KSHIP_COLOR2 });
	});
	W.pyramid({ n: n + 'nose', rz: -90, g, size: 1.5, b: KSHIP_COLOR3 });
	const arm = (i, o) => W.longRect({ ...strut, n: n + 'wing' + i, ...o });
	arm(1, { y: 2, rx: 90, ry: 45, rz: -45, });
	arm(2, { y: 2, x: 1.5, rx: 90, ry: 45, rz: 45, b });
	arm(3, { y: -2, rx: 90, ry: 45, rz: 45, });
	arm(4, { y: -2, x: 1.5, rx: 90, ry: 45, rz: -45, b });
	W.simpleSphere({ n: n + 'shield', g, size: 10, b: 'ebd69404' });
	// addAxisCubes(g, 4);
	renderables[k.n] = k;
}

export function makeStarSystem(Wparam, spaceSize, textures) {
	W = Wparam;
	// Groups and objects
	const addGroup = (n, g) => {
		const o = { n, rx: 0, ry: 0, rz: 0 };
		if (g) o.g = g;
		W.group(o);
		// groups[n] = o;
	};
	addGroup('system');
	['sun', 'ring', 'p1', 'p2', 'p3', 'a1', 'a2', 'a3'].forEach((n) => addGroup(n, 'system'));
	['ship', 'skybox'].forEach((n) => W.group({ n })); // Are not in a group

	const sunFlare = makeStarCanvas(16, `${SUN_COLOR}88`, 'sun', .7);


	const shape = 'sphere';
	const asteroid = { shape: 'simpleSphere', b: P1_COLOR };
	[
		{ shape, n: 'outerSun', g: 'sun', size: 500, b: `${SUN_COLOR}88` },
		{ shape, n: 'innerSun', g: 'sun', size: 480, b: SUN_COLOR },
		{ shape: 'billboard', n: 'sunFlare', g: 'sun', size: 640, b: SUN_COLOR, t: sunFlare },
		{ shape, n: 'planet1', g: 'p1', ...getXYCoordinatesFromPolar(.5, 3000), size: 200, b: P1_COLOR, s:1 },
		{ shape, n: 'planet2', g: 'p2', ...getXYCoordinatesFromPolar(.7, 4000), size: 120, b: P2_COLOR, s:1 },
		{ shape, n: 'planet3', g: 'p3', ...getXYCoordinatesFromPolar(2, 7000), size: 80, b: P1_COLOR, s:1 },
		{ ...asteroid, n: 'asteroid1', g: 'a1', ...getXYCoordinatesFromPolar(3, RING_RADIUS / 2), size: 30 },
		{ ...asteroid, n: 'asteroid2', g: 'a2', ...getXYCoordinatesFromPolar(3.5, RING_RADIUS / 1.7), size: 35 },
		{ ...asteroid, n: 'asteroid3', g: 'a3', ...getXYCoordinatesFromPolar(5, RING_RADIUS / 1.8), size: 40 },
	].forEach((o) => {
		W[o.shape](o);
		renderables[o.n] = o;
	});

	{
		const b = SPACE_COLOR;
		const t = makeStarFieldCanvas('sf', gen);
		[
			{ z: -spaceSize, b, t },
			{ y: -spaceSize, rx: -90, b, t },
			{ y: spaceSize, rx: 90, b, t },
			{ x: -spaceSize, ry: 90, b, t },
			{ x: spaceSize, ry: -90, b, t },
			{ z: spaceSize, rx: 180, b, t },
		].forEach((settings, i) => {
			W.plane({ b: '000', ...settings, n: `skybox${i}`, g: 'skybox', size: spaceSize * 2 });
		});
	}
	{ // Build the Player's Ship
		const b = SHIP_COLOR;
		const engT = makeHopArmor(SHIP_COLOR2, '#7bb7af');
		const t = makeHopArmor(b, '#478691');
		const g = 'ship';
		W.longPyramid({ n: 'shipBase', g, size: SHIP_SIZE * .6, y: SHIP_SIZE * .6, b, t });
		W.ufo({ n: 'shipBody', g, y: SHIP_SIZE * -.2, rx: 90, size: SHIP_SIZE * 1.3, b, s:1 });
		W.ufo({ n: 'sCockpit', g, y: SHIP_SIZE * -.2, rx: 90, z: SHIP_SIZE * .4, size: SHIP_SIZE * .5, b: `666c`, s:1 });
		// W.billboard({ n: 'pilot', g, y: SHIP_SIZE * -.2, z: SHIP_SIZE * .6, rx: 90, size: SHIP_SIZE * .4, t: makeRabbit(0) });
		const component = { n: 'shipComp1', g, x: SHIP_SIZE * -.3, y: -SHIP_SIZE * .7, ry: 0, rz: -90, size: SHIP_SIZE * .4, b, t };
		W.cube(component);
		W.cube({ ...component, n: 'shipComp2', rz: 90, x: -component.x });
		const engX = SHIP_SIZE * 1.1;
		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: engX, y: SHIP_SIZE * -.3, size: SHIP_SIZE, b: SHIP_COLOR2, t: engT };
		W.longerRect(eng);
		W.longerRect({ ...eng, n: 'shipEngine2', rz: 180, x: -engX });
		const engBack = { n: 'shipEngineBack1', g,  x: engX, y: SHIP_SIZE * -1, size: SHIP_SIZE / 3, b }; 
		W.longPyramid(engBack);
		W.longPyramid({ ...engBack, n: 'shipEngineBack2', x: -engX });
		const wing = { n: 'sWing1', g, rx: 90, ry: 90, x: -SHIP_SIZE * 0, y: SHIP_SIZE * -.3, z: SHIP_SIZE * 0, size: SHIP_SIZE * .1, b, t };
		W.plank(wing);
		const flame = { g, n: 'sFlame1', rx: 180, x: engX, y: SHIP_SIZE * -1.4, size: SHIP_SIZE * .26, b: FLAME_OFF_COLOR };
		W.longPyramid(flame);
		W.longPyramid({ ...flame, n: 'sFlame2', x: -engX });
		const ignite = { g, y: SHIP_SIZE * -1.31, rx: 70, size: .2, t: textures.tf };
		W.billboard({ ...ignite, n: 'sIgnite1', x: -SHIP_SIZE * 1.1  });
		W.billboard({ ...ignite, n: 'sIgnite2', x: SHIP_SIZE * 1.1 });
		// W.billboard({ ...ignite, n: 'sIgniteBack0', x: -SHIP_SIZE * 1.1, y: SHIP_SIZE * .6 });
		// W.billboard({ ...ignite, n: 'sIgniteBack1', x: SHIP_SIZE * 1.1, y: SHIP_SIZE * .6 });
		W.simpleSphere({ n: 'sShield', g, size: 1.2, b: 'de8b6f00', mode: 2, size: 0.01 });
		
		// addAxisCubes(g, 1);
	}
	
	loop(KLAX_COUNT, makeKlaxShip);

	const TWO_PI = Math.PI * 2;
	loop(32, (i, n) => {
		const angle = i === 0 ? 0 : (TWO_PI * i) / n;
		const rz = rad2deg(angle);
		let { x, y } = getXYCoordinatesFromPolar(angle, RING_RADIUS);
		const g = `r${i}`;
		// The ring segment (containing foundation and anything else put on it)
		W.group({ n: g, g: 'ring' });
		// The ring foundation
		W.plank({
			n: `ring${i}`,
			g,
			x,
			y,
			rz,
			size: 20,
			b: RING_COLOR,
		});
		// The ring "building"
		W.cube({
			n: `ringB${i}`,
			g,
			x,
			y,
			rz,
			size: 50,
			b: RING_COLOR2,
		});
	});
	// Create litter / stardust
	// loop(200, (i) => {
	// 	W.billboard({
	// 		n: `litter${i}`,
	// 		g: 'system',
	// 		...randCoords(RING_RADIUS * 1.5),
	// 		size: 1,
	// 		b: '555e',
	// 	});
	// });
	// Create physical crates
	loop(14, (i) => {
		const b = pick(['de8b6f', '471b6e', '524bb3', '5796a1', '464040', '775b5b']);
		const crate = {
			n: `crate${i}`,
			passType: 'crate',
			passthru: ['crate'],
			g: 'system',
			...randCoords(RING_RADIUS * 1.5),
			vel: { ...vec3() },
			size: 20,
			r: 20, // collision radius
			b,
			rx: rand(0, 359),
			ry: rand(0, 359),
			rz: rand(0, 359),
			hp: 3,
			drops: ['parts'],
			explodes: { colors: ['464040', b], size: 2, count: 10 },
			p: 1,
		};
		renderables[crate.n] = crate;
		W.cube(crate);
	});
	return {
		// groups,
		ship,
		renderables,
	};
}

export function updateSystem(t) {
	spin += t / 90;
	return {
		innerSun: { rx: spin, ry: spin * .9 },
		p1: { rz: spin * 0.1 },
		p2: { rz: spin * 0.15 },
		p3: { rz: spin * 0.05 },
		ring: { rz: spin * 0.5 },
		a1: { rz: spin * .7 },
		a2: { rz: spin * .6 },
		a3: { rz: spin * .5 },
	};
}

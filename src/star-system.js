import { makeStarCanvas, makeStarFieldCanvas } from './textures.js';
import { getXYCoordinatesFromPolar, loop, rand } from './utils.js';
import { vec3, rad2deg } from './Vector3.js';
import { SUN_COLOR, P1_COLOR, P2_COLOR, SPACE_COLOR, SHIP_COLOR, SHIP_COLOR2,
	FLAME_OFF_COLOR, KSHIP_COLOR1, KSHIP_COLOR2, KSHIP_COLOR3, RING_COLOR,
	RING_COLOR2,
} from './colors.js';
import { SHIP_SIZE, RING_RADIUS, SPACE_SIZE } from './scale.js';
import RandomGenerator from './RandomGenerator.js';

let W;

const KLAX_COUNT = 6;
const seed = 1234;
const gen = new RandomGenerator(seed);

const randCoord = (n = SPACE_SIZE) => gen.rand(-n, n);
const randCoords = (n) => ({
	x: randCoord(n),
	y: randCoord(n),
	z: randCoord(n),
});

function addAxisCubes(g, size) {
	W.cube({ n: g + 'axisX', g, x: size + 1, size, b: 'a008' });
	W.cube({ n: g + 'axisY', g, y: size + 1, size, b: '0a08' });
	W.cube({ n: g + 'axisZ', g, z: size + 1, size, b: '00a8' });
}

const ship = {
	x: 0, y: 0, z: SPACE_SIZE * .5,
	rx: -90, ry: 0, rz: 0,
	vel: { x: 0, y: 0, z: 0 },
	thrust: { x: 0, y: 0, z: 0 },
	thrustForce: 0.1,
	fireCooldown: 0,
	r: 2, // collision radius
	passType: 'ship',
	passthru: ['plasma'],
	shieldOpacity: 0,
	sight: 1500,
	aggro: 0,
	thrustCooldown: 0,
	hp: 5,
	maxHp: 5,
	facing: { x: 0, y: 1, z: 0 },
};
const klaxShip = {
	...structuredClone(ship),
	thrustForce: 0.002,
	passType: 'klaxShip',
	passthru: ['klaxPlasma'],
	facing: { x: 1, y: 0, z: 0 },
};
const klaxShips = [];
const physicsEnts = [ship];
const renderables = {};

function makeKlaxShip(i) {
	const n = `k${i}`;
	const b = KSHIP_COLOR1;
	const pos = randCoords(RING_RADIUS);
	// const pos = { x: 0, y: 0, z: 100 };

	// const { rx, ry, rz } = vec3().toWAngles(vec3(ship));
	const size = 5;
	const coreSize = size / 2;
	const strutSize = size / 2.5;
	const k = {
		n,
		...structuredClone(klaxShip),
		...pos, size: 5, r: 10,
		// rx, ry, rz,
	};
	// console.log(k);
	W.group({ n, g: 'system', ...pos,
		// rx, ry, rz,
	});
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
	
	W.longRect({ ...strut, n: n + 'wing1', y: 2, rx: 90, ry: 45, rz: -45, });
	W.longRect({ ...strut, n: n + 'wing2', y: 2, x: 1.5, rx: 90, ry: 45, rz: 45, b });
	W.longRect({ ...strut, n: n + 'wing3', y: -2, rx: 90, ry: 45, rz: 45, });
	W.longRect({ ...strut, n: n + 'wing4', y: -2, x: 1.5, rx: 90, ry: 45, rz: -45, b });
	W.sphere({ n: n + 'shield', g, size: 10, b: 'ebd69404' });
	// addAxisCubes(g, 4);
	
	physicsEnts.push(k);
	renderables[k.n] = k;
	klaxShips.push(k);
}

export function makeStarSystem(Wparam, spaceSize) {
	W = Wparam;
	// Groups and objects
	W.group({ n: 'system' });
	['sun', 'ring', 'p1', 'p2', 'p3'].forEach((n) => W.group({ n, g: 'system' }));
	['ship', 'skybox'].forEach((n) => W.group({ n })); // Are not in a group

	const sunFlare = makeStarCanvas(16, `${SUN_COLOR}88`, 'sun', .7);

	W.sphere({ n: 'outerSun', g: 'sun', size: 500, b: `${SUN_COLOR}88` });
	W.sphere({ n: 'innerSun', g: 'sun', size: 480, b: SUN_COLOR });
	W.billboard({ n: 'sunFlare', g: 'sun', size: 640, b: SUN_COLOR, t: sunFlare });
	W.sphere({ n: 'planet1', g: 'p1', ...getXYCoordinatesFromPolar(0.5, 3000), size: 200, b: P1_COLOR, s:1 });
	W.sphere({ n: 'planet2', g: 'p2', ...getXYCoordinatesFromPolar(0.7, 4000), size: 120, b: P2_COLOR, s:1 });
	W.sphere({ n: 'planet3', g: 'p3', ...getXYCoordinatesFromPolar(0.7, 7000), size: 80, b: P1_COLOR, s:1 });

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
	// W.billboard({ n: 'flare', x: 0, y: 0, z: 0, size: 96, b: '#ff6633' });
	{
		const b = SHIP_COLOR;
		const g = 'ship';
		W.longPyramid({ n: 'shipBase', g, size: SHIP_SIZE * .6, y: SHIP_SIZE * .6, b });
		W.ufo({ n: 'shipBody', g, y: SHIP_SIZE * -.2, rx: 90, size: SHIP_SIZE * 1.3, b, s:1 });
		W.ufo({ n: 'sCockpit', g, y: SHIP_SIZE * -.2, rx: 90, z: SHIP_SIZE * .4, size: SHIP_SIZE * .5, b: `666c`, s:1 });
		const component = { n: 'shipComp1', g, x: SHIP_SIZE * -.3, y: -SHIP_SIZE * .7, size: SHIP_SIZE * .4, b };
		W.cube(component);
		W.cube({ ...component, n: 'shipComp2', x: -component.x });
		const engX = SHIP_SIZE * 1.1;
		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: engX, y: SHIP_SIZE * -.3, size: SHIP_SIZE, b: SHIP_COLOR2 };
		W.longerRect(eng);
		W.longerRect({ ...eng, n: 'shipEngine2', x: -engX });
		const engBack = { n: 'shipEngineBack1', g,  x: engX, y: SHIP_SIZE * -1, size: SHIP_SIZE / 3, b }; 
		W.longPyramid(engBack);
		W.longPyramid({ ...engBack, n: 'shipEngineBack2', x: -engX });
		const wing = { n: 'sWing1', g, rx: 90, ry: 90, x: -SHIP_SIZE * 0, y: SHIP_SIZE * -.3, z: SHIP_SIZE * 0, size: SHIP_SIZE * .1, b };
		W.plank(wing);
		const flame = { g, n: 'sFlame1', rx: 180, x: engX, y: SHIP_SIZE * -1.4, size: SHIP_SIZE * .26, b: FLAME_OFF_COLOR };
		W.longPyramid(flame);
		W.longPyramid({ ...flame, n: 'sFlame2', x: -engX });
		// addAxisCubes(g, 1);
	}
	
	loop(KLAX_COUNT, makeKlaxShip);

	const TWO_PI = Math.PI * 2;
	loop(32, (i, n) => {
		const angle = i === 0 ? 0 : (TWO_PI * i) / n;
		const deg = rad2deg(angle);
		// console.log(i, angle, x, y);
		let { x, y } = getXYCoordinatesFromPolar(angle, RING_RADIUS);
		const g = `r${i}`;
		W.group({ n: g, g: 'ring' });
		W.plank({
			n: `ring${i}`,
			g,
			x,
			y,
			rz: deg,
			size: 20,
			b: RING_COLOR,
		});
		// y += 10;
		W.cube({
			n: `ringBuilding${i}`,
			g,
			x,
			y,
			rz: deg,
			size: 50,
			b: RING_COLOR2,
		});
	});
	// Create litter / stardust
	loop(300, (i) => {
		W.billboard({
			n: `litter${i}`,
			g: 'system',
			...randCoords(RING_RADIUS * 2),
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
			...randCoords(RING_RADIUS * 1.5),
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
	return {
		ship,
		renderables,
		physicsEnts,
		klaxShips,
	};
}

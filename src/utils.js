import { vec3, deg2rad } from './Vector3.js';

function loop(n, fn) {
	for (let i = 0; i < n; i += 1) { fn(i, n); }
}
const { sin, cos, PI } = Math;
const TWO_PI = PI * 2;

function getXYCoordinatesFromPolar(angle, r) {
	const x = r * Math.cos(angle);
	const y = r * Math.sin(angle);
	return { x, y };
}

function uid() { return String(Number(new Date())) + randInt(999); }

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

const wait = (ms) => (new Promise((resolve) => setTimeout(resolve, ms)));

// Some functions here from LittleJS utilities
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }
function randInt(valueA, valueB=0) { return Math.floor(rand(valueA,valueB)); }

function pick(arr) { return arr[randInt(0, arr.length)];  }
export {
	loop, sin, cos,
	PI, TWO_PI, getXYCoordinatesFromPolar,
	uid,
	rotateByDegree,
	getDirectionUnit,
	addAngles,
	clamp,
	lerp,
	rand,
	randInt,
	pick,
	wait,
};

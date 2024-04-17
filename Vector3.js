// Based off LittleJS's Vector2:
// https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L693
const vec3 = (x,y,z) => new Vector3(x,y,z);
const sin = Math.sin, cos = Math.cos;

export default class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		if (typeof x === 'object') {
			y = x.y;
			z = x.z;
			x = x.x;
		}
		this.x = x;
		this.y = y;
		this.z = z;
	}

	copy() { return vec3(this.x, this.y, this.z); }

	length() {
		return ((this.x ** 2) + (this.y ** 2) + (this.x ** 2)) ** .5;
	}

	normalize(n = 1) {
		const len = this.length();
		return (len) ? this.scale(n / len) : vec3(0, n, 0);
		// Defaults to y-axis - not sure what the best default direction is?
	}

	scale(s) {
		return vec3(this.x * s, this.y * s, this.z * s);
	}

	rotate(angleX, angleY, angleZ) {
		return this.rotateX(angleX).rotateY(angleY).rotateZ(angleZ);
	}

	rotateX(angle = 0) {
		return vec3(
			this.x,
			this.y * cos(angle) - this.z * sin(angle),
			this.y * sin(angle) + this.z * cos(angle),
		);
	}

	rotateY(angle = 0) {
		return vec3(
			this.x * cos(angle) + this.z * sin(angle),
			this.y,
			-this.x * sin(angle) + this.z * cos(angle),
		);
	}

	rotateZ(angle = 0) {
		return vec3(
			this.x * cos(angle) - this.y * sin(angle),
			this.x * sin(angle) + this.y * cos(angle),
			this.z,
		);
	}
}

export { Vector3, vec3, sin, cos };

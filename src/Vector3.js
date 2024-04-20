// Based off LittleJS's Vector2:
// https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L693
const vec3 = (x,y,z) => new Vector3(x,y,z);
// const sin = Math.sin, cos = Math.cos, atan2 = Math.atan2;
const { abs, sin, cos, asin, acos, atan2, PI, sqrt } = Math;

const rad2deg = (rad) => rad * (180/PI);
const deg2rad = (deg) => deg * (PI/180);

function multiplyMatrices(a, b) {
	const result = [];
	for (let i = 0; i < a.length; i++) {
		result[i] = [];
		for (let j = 0; j < b[0].length; j++) {
			let sum = 0;
			for (let k = 0; k < a[0].length; k++) {
				sum += a[i][k] * b[k][j];
			}
			result[i][j] = sum;
		}
	}
	return result;
}

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

	copyTo(obj) {
		obj.x = this.x;
		obj.y = this.y;
		obj.z = this.z;
	}

	add(v) {
		return vec3(
			this.x + v.x,
			this.y + v.y,
			this.z + v.z,
		);
	}

	sub(v) {
		return vec3(
			this.x - v.x,
			this.y - v.y,
			this.z - v.z,
		);
	}

	length() {
		return this.lengthSquared() ** .5;
	}

	lengthSquared() {
		return ((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
	}

	distance(v) {
		return this.distanceSquared(v) ** .5;
	}

	distanceSquared(v) {
		return ((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2);

	}

	normalize(n = 1) {
		const len = this.length();
		return (len) ? this.scale(n / len) : vec3(0, n, 0);
		// Defaults to y-axis - not sure what the best default direction is?
	}

	scale(s) {
		return vec3(this.x * s, this.y * s, this.z * s);
	}

	cross(v) {
		const { x, y, z } = this;
		return vec3(
			y * v.z - z * v.y,
			z * v.x - x * v.z,
			x * v.y - y * v.x,
		);
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

	toAngles(targetVector) {
		let { x, y, z } = this;
		if (targetVector) {
			// return vec3(targetVector).sub(this).toAngles();
			x = targetVector.x - x;
			y = targetVector.y - y;
			z = targetVector.z - z;
		}
		// Calculate yaw (rotation around z-axis)
		const yaw = atan2(y, x);
	
		// Calculate pitch (rotation around y-axis)
		const pitch = atan2(-z, sqrt(x * x + y * y));
	
		// Calculate roll (rotation around x-axis)
		let roll = 0; // By default, assume roll is 0
	
		// If the target vector is not parallel to the xy-plane
		if (x !== 0 || y !== 0) {
			// Calculate the projected vector onto the xy-plane
			const projectedVector = {
				x: sqrt(x * x + y * y),
				y: 0,
				z
			};
			// Calculate the angle between the projected vector and the z-axis
			roll = atan2(projectedVector.z, projectedVector.x);
		}
		return { roll, pitch, yaw };
	}

	toWAngles(targetVector) {
		const { roll, pitch, yaw } = this.toAngles(targetVector);
		return {
			rx: rad2deg(roll),
			ry: rad2deg(pitch),
			rz: rad2deg(yaw),
		};
	}

	/*
	toAngles() {
		const { x, y, z } = this.normalize();
		return {
			yaw: atan2(x, z),
			pitch: atan2(y, sqrt(x ** 2 + z ** 2)),
		};
	}

	toRotationMatrices() {
		const { yaw, pitch } = this.toAngles();
		const rmy = [ // rotation matrix for yaw (horizontal rotation around y-axis)
			[cos(yaw), 0, -sin(yaw)],
			[0, 1, 0],
			[sin(yaw), 0, cos(yaw)],
		];
		const rmx = [
			[1, 0, 0],
			[0, cos(pitch), sin(pitch)],
			[0, -sin(pitch), cos(pitch)],
		];
		return {
			rmx,
			rmy,
			rmz: multiplyMatrices(rmy, rmx),
		};
	}

	toRotations() {
		const { rmx, rmy, rmz } = this.toRotationMatrices();
		return {
			rx: atan2(rmy[2][1], rmy[2][2]),
			ry: atan2(-rmy[2][0], sqrt(
				rmx[2][1] ** 2 + rmx[2][2] ** 2 
			)),
			rz: atan2(rmx[1][0], rmx[0][0]),
		};
	}

	// Theta represents the rotation around the Y-axis,
	// and phi represents the angle from the positive Z-axis.
	toSpherical() {
		const { x, y, z } = this;
		const radius = this.length();
		return {
			radius,
			theta: atan2(x, z),
			phi: acos(y / radius),
		};
	}

	// From https://gemini.google.com/app/98d37f6718cb75c3
	getLookAtRotation(target, up = vec3(0, 1, 0)) {
		const direction = vec3(target).sub(this).normalize();
		console.log('--------\n\t', { ...direction });
		// Handle zero-length direction (object already at target)
		// No need to rotate if already facing target
		if (direction.lengthSquared() === 0) return;
		// Create orthogonal vector (assuming uniform scale) ???
		// const right = vec3(up).cross(direction).normalize();
		const right = direction.cross(up).normalize();
		console.log('\tright:', { ...right });

		// Create final up vector (completing the basis) ???
		const finalUp = direction.cross(right).normalize();
		// Construct rotation matrix (assuming uniform scale)
		const rotationMatrix = new Float32Array([
			right.x, right.y, right.z, 0,
			finalUp.x, finalUp.y, finalUp.z, 0,
			direction.x, direction.y, direction.z, 0,
			0, 0, 0, 1,
		]);
		// Apply rotation matrix to object (assuming object has a rotation property)
		// rotation.setFromRotationMatrix(rotationMatrix);
		return Vector3.rotationMatrixToEuler(rotationMatrix);
	}

	static rotationMatrixToEuler(matrix = []) {
		// Check matrix dimensions (should be 4x4)
		// if (matrix.length !== 16) {
		// 	console.error("Invalid matrix size. Expected 4x4 matrix.");
		// 	return null;
		// }
		const m11 = matrix[0],
			m12 = matrix[1],
			m13 = matrix[2],
			m21 = matrix[4],
			m22 = matrix[5],
			m23 = matrix[6],
			m31 = matrix[8],
			m32 = matrix[9],
			m33 = matrix[10];
		// Potential gimbal lock - check for close to -1 or 1 in m22
		const epsilon = 0.000001;
		if (abs(m22) > (1 - epsilon)) {
			console.warn("Gimbal lock detected. Euler angles may be inaccurate.");
			// Handle Gimbal Lock (choose one approach based on your needs)
			// Option 1: Set one angle to zero (e.g., set x to zero)
			// return { x: 0, y: atan2(m13, m33), z: atan2(m21, m23) };
			// Other options: Use alternate calculation (https://www.euclideanspace.com/maths/rotations/conversions/matrixtoeuler.htm)
		}
		// Assuming no gimbal lock
		return vec3(
			atan2(-m31, m11), asin(m23), atan2(-m21, m22)
		);
	}
	*/
	  
}

export { Vector3, vec3, sin, cos, multiplyMatrices,
	rad2deg, deg2rad,
};

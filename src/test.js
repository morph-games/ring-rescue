import W from './w.esm.js'; 
import { addRect } from './w-tools.js';
import { vec3 } from './Vector3.js';

// NOTE that W uses a Right-handed Cartesian Coordinate system


// ChatGPT suggested this
// It claims it should work with Z-Y-X order, but it doesn't seem to work
function calculateRotationsZYX(objectPos, targetPos, upVector = { x: 0, y: 1, z: 0 }) {
    // Calculate direction vector from object to target
    const direction = {
        x: targetPos.x - objectPos.x,
        y: targetPos.y - objectPos.y,
        z: targetPos.z - objectPos.z
    };

    // Calculate rotation around rz (Roll) axis
    const upCrossDirection = {
        x: upVector.y * direction.z - upVector.z * direction.y,
        y: upVector.z * direction.x - upVector.x * direction.z,
        z: upVector.x * direction.y - upVector.y * direction.x
    };
    const right = {
        x: upVector.y * upCrossDirection.z - upVector.z * upCrossDirection.y,
        y: upVector.z * upCrossDirection.x - upVector.x * upCrossDirection.z,
        z: upVector.x * upCrossDirection.y - upVector.y * upCrossDirection.x
    };
    const roll = Math.atan2(right.y, upVector.y);

    // Calculate rotation around ry (Yaw) axis
    const yaw = Math.atan2(direction.x, direction.z);

    // Calculate rotation around rx (Pitch) axis
    const distanceXZ = Math.sqrt(direction.x ** 2 + direction.z ** 2);
    const pitch = Math.atan2(direction.y, distanceXZ);

    return { pitch, yaw, roll };
}

// Supposedly for XYZ order
function calculateRotations(objectPos, targetPos, upVector = { x: 0, y: 1, z: 0 }) {
    // Calculate direction vector from object to target
    const direction = {
        x: targetPos.x - objectPos.x,
        y: targetPos.y - objectPos.y,
        z: targetPos.z - objectPos.z
    };

    // Calculate rotation around rx (Pitch) axis
    const distanceXZ = Math.sqrt(direction.x ** 2 + direction.z ** 2);
    const pitch = Math.atan2(direction.y, distanceXZ);

    // Calculate rotation around ry (Yaw) axis
    const yaw = Math.atan2(direction.x, direction.z);

    // Calculate rotation around rz (Roll) axis
    const upCrossDirection = {
        x: upVector.y * direction.z - upVector.z * direction.y,
        y: upVector.z * direction.x - upVector.x * direction.z,
        z: upVector.x * direction.y - upVector.y * direction.x
    };
    const right = {
        x: upVector.y * upCrossDirection.z - upVector.z * upCrossDirection.y,
        y: upVector.z * upCrossDirection.x - upVector.x * upCrossDirection.z,
        z: upVector.x * upCrossDirection.y - upVector.y * upCrossDirection.x
    };
    const roll = Math.atan2(right.y, upVector.y);
    return { pitch, yaw, roll };
}

function vectorToAngles(objectPos, targetPos) {
    const direction = {
        x: targetPos.x - objectPos.x,
        y: targetPos.y - objectPos.y,
        z: targetPos.z - objectPos.z
    };
    // Calculate yaw (rotation around z-axis)
    let yaw = Math.atan2(direction.y, direction.x);

    // Calculate pitch (rotation around y-axis)
    let pitch = Math.atan2(-direction.z, Math.sqrt(direction.x * direction.x + direction.y * direction.y));

    // Calculate roll (rotation around x-axis)
    let roll = 0; // By default, assume roll is 0

    // If the target vector is not parallel to the xy-plane
    if (direction.x !== 0 || direction.y !== 0) {
        // Calculate the projected vector onto the xy-plane
        let projectedVector = {
            x: Math.sqrt(direction.x * direction.x + direction.y * direction.y),
            y: 0,
            z: direction.z
        };
        // Calculate the angle between the projected vector and the z-axis
        roll = Math.atan2(projectedVector.z, projectedVector.x);
    }
    return { roll, pitch, yaw };
}





const { PI } = Math;

function rad2deg(rad) { return rad * (180/PI); }
function deg2rad(deg) { return deg * (PI/180); }
function rotationVector3ToW(v) {
	if (typeof v.pitch === 'number') {
		return {
			rx: rad2deg(v.roll),
			ry: rad2deg(v.pitch),
			rz: rad2deg(v.yaw),
		};
	}
	return {
		rx: rad2deg(v.x),
		ry: rad2deg(v.y),
		rz: rad2deg(v.z),
	};
}

const c = document.getElementById('canvas');
W.reset(c);
W.clearColor('111');
W.camera({ x: 20, y: 20, z: 50, rx: -17, ry: 17 });
W.light({ x: -1, y: -1.2, z: 0 }); // Set light direction: vector direction x, y, z
W.ambient(0.8); // Set ambient light's force (between 0 and 1)

const g = 'test';
W.group({ n: g });
W.cube({ n: '1', g, size: 5, b: '555d' });
W.cube({ n: 'noseX', g, x: 4, size: 3, b: 'a00d' });
W.cube({ n: 'noseY', g, y: 4, size: 3, b: '0a0d' });
W.cube({ n: 'noseZ', g, z: 4, size: 3, b: '00ad' });


addRect('ringWall', { y: 50 });
W.ringWall({ n: 'y', b: '5d5' });
W.ringWall({ n: 'x', rz: 90, b: 'd55' });
W.ringWall({ n: 'z', rx: 90, b: '55d' });
W.cube({ x: 20, size: 2, b: 'd22' });
W.cube({ y: 20, size: 2, b: '2d2' });
W.cube({ z: 20, size: 2, b: '22d' });

const wait = (t) => (new Promise((resolve) => setTimeout(resolve, t)));

const coords = [
	[0, 0, 0],
	[0, 0, 1],
	[0, 1, 1],
	[0, 1, 0],
	[1, 0, 0], // same as [0, 0, 0]
	[1, 1, 0],
	[0, 1, 0],
	[-1, 1, 0],
	[-1, 0, 0],
	[-1, -1, 0],
	[0, -1, 0],
	[1, -1, 0],
	[0, 0, 0],
	// [-1, 0, 0],
	// [0, 1, 0],
	// [0, -1, 0],
	// [0, 0, 1],
	// [0, 0, -1],
	// [1, 1, 1],
];

async function display(i) {
	if (i >= coords.length) return;
	const [x, y, z] = coords[i];
	const v = vec3(x, y, z);
	// const rotVector = vec3().getLookAtRotation(v);
	// const rotVector = calculateRotations(vec3(), v);
	const rotVector = vec3().toAngles(v);
	const rot = rotationVector3ToW(rotVector);
	console.log(v, rotVector, rot);
	W.move({ n: g, ...rot, a: 800 }, 200);
	await wait(1000);
	display(++i);
}

display(0);

// Appears to be applying rotations in XYZ order
// W.move({ n: g, rx: 90, ry: 90, rz: 90, a: 800 }, 500);

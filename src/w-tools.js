import W from './w.custom.esm.js';

// Cube
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |  x  | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

export function addRect(name = 'cube', { x = .5, y = .5, z = .5 } = {}) {
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

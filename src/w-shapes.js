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

function addRect(name, { x = .5, y = .5, z = .5 } = {}) {
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

// Pyramid
//
//      ^
//     /\\
//    // \ \
//   /+-x-\-+
//  //     \/
//  +------+

function addPyramid(name, { x = .5, y = .5, z = .5 } = {}) {
	W.add(name, {
		vertices: [
			-x,-y, z,   x,-y, z,    0,  y,  0,  // Front
			 x,-y, z,   x,-y,-z,    0,  y,  0,  // Right
			 x,-y,-z,  -x,-y,-z,    0,  y,  0,  // Back
			-x,-y,-z,  -x,-y, z,    0,  y,  0,  // Left
			 x,-y, z,  -x,-y, z,   -x, -y, -z, // down
			 x,-y, z,  -x,-y,-z,    x, -y, -z
		],
		uv: [
			0, 0,   1, 0,  .5, 1,  // Front
			0, 0,   1, 0,  .5, 1,  // Right
			0, 0,   1, 0,  .5, 1,  // Back
			0, 0,   1, 0,  .5, 1,  // Left
			1, 1,   0, 1,   0, 0,  // down
			1, 1,   0, 0,   1, 0
		]
	});
}

// Sphere
//
//          =   =
//       =         =
//      =           =
//     =      x      =
//      =           =
//       =         =
//          =   =

function addSphere(name, { x = 2, y = 2, z = 2, precision = 20, i, ai, j, aj, p1, p2, vertices = [], indices = [], uv = []} = {}) { 
	const { PI, sin, cos } = Math;
	for(j = 0; j <= precision; j++){
		aj = j * PI / precision;
		for(i = 0; i <= precision; i++){
			ai = i * 2 * PI / precision;
			vertices.push(+(sin(ai) * sin(aj)/x).toFixed(6), +(cos(aj)/y).toFixed(6), +(cos(ai) * sin(aj)/z).toFixed(6));
			uv.push((sin((i/precision))) * 3.5, -sin(j/precision))
			if(i < precision && j < precision){
			indices.push(p1 = j * (precision + 1) + i, p2 = p1 + (precision + 1), (p1 + 1), (p1 + 1), p2, (p2 + 1));
			}
		}
	}
	W.add(name, {vertices, uv, indices});
};

export { addRect, addPyramid, addSphere };

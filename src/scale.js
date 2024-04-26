// Note that max distance is 1000
// So world can be -500 --> 500 in any dimensions
// Solar system is 30 trillion km diameter
// so if the scale matches, then each 1.0 unit = 30 billion km

const SHIP_SIZE = .3;
const RING_RADIUS = 2000;
const FAR = 30000;
const SPACE_SIZE = FAR / 2; // The "radius" of the world
const SCAN_SIZE = 120;
export {
	SHIP_SIZE,
	RING_RADIUS,
	FAR,
	SPACE_SIZE,
	SCAN_SIZE,
};

const doc = window.document;
const isLocked = () => !!doc.pointerLockElement;
export default {
	lockMove: { x: 0, y: 0 },
	move: { x: 0, y: 0 },
	wheel: 0,
	click: null,
	lockElt: null,
	down: {},
	isLocked,
	async lock() {
		if (!isLocked()) await this.lockElt.requestPointerLock();
	},
	async toggleLock() {
		if (isLocked()) await this.unlock();
		else await this.lock();
	},
	async unlock() {
		await doc.exitPointerLock();
	},
	/** Get movement since last time movement was requested (i.e., last frame) */
	getLockMove() {
		const o = { ...this.lockMove };
		this.lockMove.x = 0;
		this.lockMove.y = 0;
		return o;
	},
	getWheel() {
		const w = this.wheel;
		this.wheel = 0;
		return w;
	},
	getClick() {
		const c = this.click;
		this.click = null;
		return c;
	},
	setup(o = {}) {
		this.lockElt = o.lockElt;
		onmousemove = (e) => {
			const move = this[isLocked() ? 'lockMove' : 'move'];
			move.x += e.movementX;
			move.y += e.movementY;
		};
		onkeydown = (e) => {
			this.down[e.key] = true;
			if (!e.repeat && o.keys && o.keys[e.key]) {
				o.keys[e.key]();
				e.preventDefault();
			}
		};
		onkeyup = (e) => {
			this.down[e.key] = false;
		};
		onwheel = (e) => {
			this.wheel += e.deltaY;
		};
		const handleClick = (e) => {
			const { clientX, clientY, button } = e;
			this.click = { clientX, clientY, button, left: button === 0, right: button === 2,
				locked: isLocked(),
			};
		}
		onclick = handleClick;
		oncontextmenu = handleClick;
	},
};

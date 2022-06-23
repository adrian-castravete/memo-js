export default class Memo {
	MEMORY_TOP = 65536
	WIDTH = 320
	HEIGHT = 200
	SCREEN_OFFSET = 0
	PALETTE_OFFSET = 64000

	constructor(cvs) {
		this.memory = new ArrayBuffer(this.MEMORY_TOP)
		this.mem8 = new Uint8Array(this.memory)
		this.standardPalette()
		
		this.view = {
			offsetX: 0,
			offsetY: 0,
			scale: 2,
		}
		const g = cvs.getContext("2d")
		g.imageSmoothingEnabled = false

		this.canvas = cvs
		this.context = g

		const ic = document.createElement("canvas")
		ic.width = this.WIDTH
		ic.height = this.HEIGHT
		const ig = ic.getContext("2d")
		ig.imageSmoothingEnabled = false

		this.internalCanvas = ic
		this.internalContext = ig
		this.imageData = ig.createImageData(this.WIDTH, this.HEIGHT)
	}

	resize(w, h) {
		const s = Math.floor(Math.min(w / this.WIDTH, h / this.HEIGHT))
		const ox = Math.floor((w - this.WIDTH * s) * 0.5)
		const oy = Math.floor((h - this.HEIGHT * s) * 0.5)

		this.view = {
			offsetX: ox,
			offsetY: oy,
			scale: s,
		}
		console.log("resized")
	}

	standardPalette() {
		const startPal = [
			0, 0, 0,
			0, 0, 170,
			0, 170, 0,
			0, 170, 170,
			170, 0, 0,
			170, 0, 170,
			170, 85, 0,
			170, 170, 170,
			85, 85, 85,
			85, 85, 255,
			85, 255, 85,
			85, 255, 255,
			255, 85, 85,
			255, 85, 255,
			255, 255, 85,
			255, 255, 255,
		]
		for (let i = 0; i < 48; i += 1) {
			this.mem8[this.PALETTE_OFFSET + i] = startPal[i]
		}
		for (let b = 0; b <= 5; b += 1) {
			for (let g = 0; g <= 5; g += 1) {
				for (let r = 0; r <= 5; r += 1) {
					const o = this.PALETTE_OFFSET + 48 + (b * 36 + g * 6 + r) * 3
					this.mem8[o + 0] = r > 0 ? Math.floor(45 + 40 * r) : 0
					this.mem8[o + 1] = g > 0 ? Math.floor(45 + 40 * g) : 0
					this.mem8[o + 2] = b > 0 ? Math.floor(45 + 40 * b) : 0
				}
			}
		}
		for (let i = 0; i < 24; i += 1) {
			const o = this.PALETTE_OFFSET + (16 + 216 + i) * 3;
			const v = Math.floor(8 + 10 * i)
			this.mem8[o + 0] = v
			this.mem8[o + 1] = v
			this.mem8[o + 2] = v
		}
	}

	do(frame, line) {
		this.running = true
		
		let skipped = -1
		let oldTick = 0
		const _frame = (tick) => {
			if (skipped >= 100) {
				console.error(`${skipped} frames skipped.  Stopping...`)
				this.running = false
				return
			}
		
			if (this.running) {
				requestAnimationFrame(_frame)
			}
			skipped += 1

			const mem8 = this.mem8
			const view = this.view
			const idata = this.imageData
			const ig = this.internalContext
			const g = this.context
			frame(mem8, tick - oldTick)
		
			for (let j = 0; j < 200; j += 1) {
				if (line) {
					line(mem8, j)
				}
				for (let i = 0; i < 320; i += 1) {
					const bo = j * 320 + i
					const v = mem8[bo]
					const o = bo * 4;
					idata.data[o + 0] = mem8[64000 + v * 3 + 0]
					idata.data[o + 1] = mem8[64000 + v * 3 + 1]
					idata.data[o + 2] = mem8[64000 + v * 3 + 2]
					idata.data[o + 3] = 255
				}
			}
			ig.imageSmoothingEnabled = false
			ig.putImageData(idata, 0, 0)
		
			g.imageSmoothingEnabled = false
			g.strokeStyle = "#0f0"
			g.save()
			g.translate(view.offsetX, view.offsetY)
			g.scale(view.scale, view.scale)
			g.drawImage(this.internalCanvas, 0, 0)
			g.restore()
		
			oldTick = tick
			skipped -= 1
		}
		requestAnimationFrame(_frame)
	}
}

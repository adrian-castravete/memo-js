function rand(s, o) {
	if (!s) {
		s = 256
	}

	if (!o) {
		o = s
		s = 0
	}

	return Math.floor(Math.random() * (o - s) + s)
}


function frame(mem8, dt) {
	const first = mem8.slice(64000 + 232 * 3, 64000 + 233 * 3)
	for (let i = 232; i < 255; i += 1) {
		for (let j = 0; j < 3; j += 1) {
			const o = i * 3 + j
			mem8[64000 + o] = mem8[64003 + o]
		}
	}
	for (let j = 0; j < 3; j += 1) {
		mem8[64765 + j] = first[j]	
	}
}

function line(mem8, n) {
	mem8[64000] = 0
	mem8[64001] = 0
	mem8[64002] = n
}


import Memo from "./memo.mjs"

const cvs = document.getElementById("paper")

const memo = new Memo(cvs)
/*
for (let j = 0; j < 16; j += 1) {
	for (let i = 0; i < 16; i += 1) {
		for (let l = 0; l < 4; l += 1) {
			for (let k = 0; k < 4; k += 1) {
				const x = i * 4 + k
				const y = j * 4 + l
				memo.mem8[y * 320 + x] = j * 16 + i
			}
		}
	}
}
//*/
for (let j = 0; j < 200; j += 1) {
	for (let i = 0; i < 320; i += 1) {
		const v = Math.floor(Math.cos(i / 6) * Math.cos(j / 6) * 12 + 244)
		memo.mem8[j * 320 + i] = v
	}
}
memo.do(frame, line)

function resize() {
	const [w, h] = [window.innerWidth, window.innerHeight]
	cvs.width = w
	cvs.height = h
	memo.resize(w, h)
}
window.addEventListener("resize", resize)
resize()

var t = require('tape');
var createOscillator = require('./');
var createBuffer = require('audio-buffer-from')
var to = require('pcm-convert')

t('No buffer case', t => {
	let oscillate = createOscillator()

	let buf = oscillate()

	t.equal(buf.length, 1024)
	t.ok(buf.getChannelData(0)[100])

	let buf2 = oscillate()

	t.notDeepEqual(buf.getChannelData(0), buf2.getChannelData(0))

	t.end()
});

t('Fill audiobuffer', t => {
	let osc = createOscillator()

	let buf = createBuffer(1000, 2)
	let buf2 = osc(buf)

	t.equal(buf.length, 1000)
	t.ok(buf.getChannelData(0)[100])
	t.ok(buf.getChannelData(1)[100])
	t.equal(buf, buf2)
	t.end()
})

t('Sine', t => {
	let osc = createOscillator({dtype: 'float32 44100', frequency: 11025})

	let arr = osc(4)

	t.ok(arr instanceof Float32Array)
	t.deepEqual(to(arr, 'uint8'), to([0, 1, 0, -1], 'uint8'))

	t.end()
})

t('Triangle', function (t) {
	let tri = createOscillator({
		type: 'triangle',
		dtype: 'int8',
		frequency: 11025
	})

	let arr = tri(4)

	t.ok(arr instanceof Int8Array)
	t.deepEqual(arr, [127, 0, -128, 0])

	tri(arr, {ratio: 0})

	t.deepEqual(arr, [-128, -64, 0, 63])

	tri(arr, {ratio: 1})

	t.deepEqual(arr, [127, 63, 0, -64])

	t.end()
});

t('Square', function (t) {
	let sq = createOscillator({
		type: 'square',
		frequency: 44100/8,
		dtype: 'array'
	})

	let arr = sq(8)

	t.equal(arr.length, 8)
	t.ok(Array.isArray(arr))
	t.deepEqual(arr, [1,1,1,1,-1,-1,-1,-1])


	let sq0 = createOscillator({
		type: 'square',
		frequency: 44100/8,
		dtype: 'float64',
		ratio: 0
	})

	let arr0 = sq0(8)

	t.equal(arr0.length, 8)
	t.ok(ArrayBuffer.isView(arr0))
	t.deepEqual(arr0, [-1,-1,-1,-1,-1,-1,-1,-1])


	let sq1 = createOscillator({
		type: 'square',
		frequency: 44100/8,
		dtype: 'float64',
		ratio: 1
	})

	let arr1 = sq1(8)

	t.equal(arr1.length, 8)
	t.ok(ArrayBuffer.isView(arr1))
	t.deepEqual(arr1, [1,1,1,1,1,1,1,1])

	t.end()
});

t('Pulse', function (t) {
	let pulse = createOscillator({
		type: 'pulse',
		frequency: 440,
		dtype: 'arraybuffer'
	})

	let arr = pulse(8)

	t.equal(arr.byteLength, 8)
	t.ok(arr instanceof ArrayBuffer)
	t.deepEqual(new Uint8Array(arr), [255,127,127,127,127,127,127,127])

	t.end()
});

t('Saw', function (t) {
	let saw = createOscillator({
		type: 'sawtooth',
		frequency: 44100/4,
		dtype: 'array'
	})

	let arr = saw(4)

	t.deepEqual(arr, [1, .5, 0, -.5])

	let arr2 = saw(arr, {inversed: true})

	t.deepEqual(arr, [-1, -.5, 0, .5])
	t.equal(arr, arr2)

	t.end()
});

t('fourier series', function (t) {
	let osc = createOscillator({
		type: 'series',
		normalize: true,
		frequency: 44100/4,
		dtype: 'uint16'
	})

	let oscSin = createOscillator({
		type: 'sin',
		normalize: true,
		frequency: 44100/4,
		dtype: 'uint16'
	})

	// let sin = oscSin(4, {phase: .25})
	// let arr = osc(4)
	// t.deepEqual(arr, sin)


	let sin1 = oscSin(4, {phase: 0})
	let sin2 = oscSin(4, {frequency: 44100/2, phase: 0})
	sin1 = sin1.map((v, i) => (v + sin2[i])/2 )
	arr = osc(4, {real: null, imag: [0, 1, 1]})

	t.deepEqual(arr, sin1)

	t.end()
});

t('detune', function (t) {
	let osc = createOscillator({
		type: 'sine',
		frequency: 44100/4,
		dtype: 'int8'
	})

	let arr = osc(8)

	t.deepEqual(arr, [0, 127, 0, -128, 0, 127, 0, -128])

	osc(arr, {detune: -1200})

	t.deepEqual(arr, [0,89,127,89,0,-90,-128,-90])

	t.end()
});

t('function params', t => {
	let osc = createOscillator({
		type: 'tri',
		dtype: 'uint8',
		sampleRate: 8000,
		ratio: ctx => ctx.count ? 0 : .5,
		frequency: ctx => ctx.count ? ctx.sampleRate/4 : ctx.sampleRate/2
	})

	let arr = osc(8)
	t.deepEqual(arr, [255, 0, 255, 0, 255, 0, 255, 0])

	osc(arr)
	t.deepEqual(arr, [0, 63, 127, 191, 0, 63, 127, 191])

	t.end()
})

t('function type', t => {
	let osc = createOscillator({
		type: ctx => {
			return t % 0.5
		},
		frequency: ctx => ctx.t,
		dtype: 'int8'
	})

	t.end()
})

t('pass params', t => {

	t.end()
})

t('pass frequency in format', t => {

	t.end()
})

t('multichannel data', t => {

	t.end()
})

t('Output float32 arrays', t => {
	let sine = createOscillator({
		type: 'sine',
		dtype: 'float32 planar',
		channels: 2
	})
	let samples = sine(1024) //samples.length == 2048
	t.end()
})

t('Change params dynamically', t => {
	let tri = createOscillator({
		type: 'triangle',
		frequency: (t, ctx) => t/100,
		sampleRate: 8000,
		dtype: 'uint8'
	})

	let arr0 = tri(1024, {ratio: .3})
	let arr1 = tri(1024, {ratio: .4})
	let arr2 = tri(1024, {ratio: .5})
	t.end()
})

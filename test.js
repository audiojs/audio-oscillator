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
	let osc = createOscillator({format: 'float32 44100', frequency: 11025})

	let arr = osc(4)

	t.ok(arr instanceof Float32Array)
	t.deepEqual(to(arr, 'uint8'), to([0, 1, 0, -1], 'uint8'))

	t.end()
})

t('Triangle', function (t) {
	let tri = createOscillator({
		type: 'triangle',
		format: 'int8',
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

t.only('Square', function () {
	let sq = Oscillator({
		type: 'square'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

t('Pulse', function () {
	let pulse = Oscillator({
		type: 'pulse'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

t('Saw', function () {
	let saw = Oscillator({
		type: 'saw'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

t('real/imag data', function () {
	let wave = Oscillator({
		type: 'wave',
		normalize: true
	})
	.setPeriodicWave([0, 1, 0, 0], [0, 1, 1, 1])
	.pipe(Slice(2))
	.pipe(Speaker())
});

t('Detune', function () {
	let detuned = Oscillator({
		type: 'saw',
		detune: 50
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});


t('Float32Array', function () {
	let osc = Oscillator({
		frequency: 1000,
		dtype: 'float32'
	})

	let arr = osc()
})


t('float32 case', t => {
	let oscillate = createOscillator({
		dtype: 'float32'
	})

	let arr = oscillate(1024)
})

t('uint8 case', t => {
	//need uint8 filled with sine, regularly
	let osc = createOscillator({
		dtype: 'uint8'
	})

	let arr = osc(1024)
})

t('timbre experiment', t => {
	//need to reproduce timbre
	let timbre = createOscillator({
		frequency: 100,
		real: [0, .1, .2, .1, .2, .5, .2, .1, .2, .1, 1]
	})

	let arr = timbre(1024)
})

t('function params')

t('pass params')

t('pass params')

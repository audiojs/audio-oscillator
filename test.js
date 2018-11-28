'use strict'

var t = require('tape');
var osc = require('./');
var createBuffer = require('audio-buffer-from')
var to = require('pcm-convert')



t.skip('No buffer case', t => {
	// DEPRECATED: format is no more available

	let osc = createOscillator({format: 'audiobuffer'})

	let buf = osc()

	t.equal(buf.length, 1024)
	t.ok(buf.getChannelData(0)[100])

	let buf2 = osc()

	t.notDeepEqual(buf.getChannelData(0), buf2.getChannelData(0))

	t.end()
});

t('Fill audiobuffer', t => {
	let buf = createBuffer(1000, 2)
	let buf2 = osc.sin(buf)

	t.equal(buf.length, 1000)
	t.ok(buf.getChannelData(0)[100])
	t.ok(buf.getChannelData(1)[100])
	t.equal(buf, buf2)
	t.end()
})

t('Sine', t => {
	let arr = osc.sin(4, 11025)

	t.deepEqual(to(arr, 'uint8'), to([0, 1, 0, -1], 'uint8'))

	t.end()
})

t('Triangle', function (t) {
	var tri = osc.tri

	let arr = tri(4, 11025)

	t.deepEqual(to(arr, 'int8'), [127, 0, -128, 0])

	tri(arr, {ratio: 0})

	t.deepEqual(to(arr, 'int8'), [-128, -64, 0, 63])

	tri(arr, {ratio: 1})

	t.deepEqual(to(arr, 'int8'), [127, 63, 0, -64])

	t.end()
});

t('Square', function (t) {
	var sq = osc.rect

	let arr = sq(8, 44100 / 8)

	t.equal(arr.length, 8)
	t.deepEqual(to(arr, 'float32'), [1,1,1,1,-1,-1,-1,-1])

	let arr0 = sq(8, {ratio: 0})

	t.equal(arr0.length, 8)
	t.deepEqual(to(arr0, 'float32'), [-1,-1,-1,-1,-1,-1,-1,-1])

	let arr1 = sq(8, {ratio: 1})

	t.equal(arr1.length, 8)
	t.deepEqual(to(arr1, 'float32'), [1,1,1,1,1,1,1,1])

	t.end()
});

t.skip('Pulse', function (t) {
	// DEPRECATED: use rect(ratio: 1/sampleRate)
	let pulse = oscillate.pulse()

	let arr = pulse(8)

	t.equal(arr.byteLength, 8)
	t.ok(arr instanceof ArrayBuffer)
	t.deepEqual(new Uint8Array(arr), [255,127,127,127,127,127,127,127])

	t.end()
});

t('Saw', function (t) {
	let saw = osc.saw

	let arr = saw(4, 44100/4)

	t.deepEqual(to(arr, 'float32'), [1, .5, 0, -.5])

	let arr2 = saw(arr, {inversed: true})

	t.deepEqual(to(arr, 'float32'), [-1, -.5, 0, .5])
	t.equal(arr, arr2)

	t.end()
});

t('clausen', t => {
	let cl = osc.clausen

	let arr = cl(8)
	t.deepEqual(to(arr, 'uint8'), [127,150,172,190,205,216,224,230])

	t.end()
})

t('fourier series', function (t) {
	let series = osc.series
	let oscSin = osc.sin

	let sin = oscSin(4, {phase: .25, f: 44100/4})
	let arr = series(4, {f: 44100/4, normalize: true})
	t.deepEqual(to(arr, 'uint16'), to(sin, 'uint16'))


	let sin1 = oscSin(4, {f: 44100/4, phase: 0})
	let sin2 = oscSin(4, {frequency: 44100/2, phase: 0})
	sin1 = sin1.map((v, i) => (v + sin2[i])/2 )
	let arr2 = series(4, {real: null, imag: [0, 1, 1], f: 44100/4})

	t.deepEqual(to(arr2, 'uint16'), to(sin1,'uint16'))

	t.end()
});

t('detune', function (t) {
	let s = osc.sin

	let arr = s(8, 44100/4)

	t.deepEqual(to(arr, 'int8'), [0, 127, 0, -128, 0, 127, 0, -128])

	s(arr, {f: 44100/4, detune: -1200, t: 0})

	t.deepEqual(to(arr, 'int8'), [0,89,127,89,0,-90,-128,-90])

	t.end()
});

t.skip('function params', t => {
	// DEPRECATED: fn params are forbidden

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
	//non-adjusted
	// t.deepEqual(arr, [0, 63, 127, 191, 0, 63, 127, 191])

	//adjusted
	t.deepEqual(arr, [127, 191, 0, 63, 127, 191, 0, 63])

	t.end()
})

t.skip('function type', t => {
	// DEPRECATED: fn params are forbidden

	let osc = createOscillator({
		type: ctx => {
			return ctx.t
		},
		frequency: ctx => ctx.sampleRate/4,
		dtype: 'array'
	})

	let arr = osc(8)
	t.deepEqual(arr, [0, .25, .5, .75, 0, .25, .5, .75])

	t.end()
})

t.skip('pass params', t => {
	// DEPRECATED: no context needed anymore

	let osc = createOscillator({
		type: ctx => ctx.a,
		dtype: 'array',
		a: 0
	})

	let arr = osc(4, {a: 1})
	t.deepEqual(arr, [1,1,1,1])

	t.end()
})

t('multichannel data', t => {

	let arr = osc.sin([Array(4), Array(4), Array(4)], {sampleRate: 10000, f: 2500})

	t.deepEqual(to(arr[0], 'int8'), [0, 127, 0, -128])
	t.deepEqual(to(arr[1], 'int8'), [0, 127, 0, -128])
	t.deepEqual(to(arr[2], 'int8'), [0, 127, 0, -128])

	t.end()
})

t.skip('Output float32 arrays', t => {
	// DEPRECATED: single array returned by default
	let sine = createOscillator({
		type: 'sine',
		dtype: 'float32 planar',
		channels: 2
	})
	let samples = sine(2)

	t.equal(samples.length, 4)
	t.equal(samples[0], samples[2])
	t.equal(samples[1], samples[3])

	let samples2 = sine(2)

	t.equal(samples2.length, 4)
	t.equal(samples2[0], samples2[2])
	t.equal(samples2[1], samples2[3])

	t.end()
})

t('Direct output', t => {
	t.deepEqual(to(osc.sin(4, {frequency: 22050 / 2}), 'int8'), [0, 127, 0, -128])

	t.deepEqual(to(osc.sin(4, {phase: .5, frequency: 22050 / 2}), 'int8'), [0, -128, 0, 127])

	t.end()
})


t('changed detune/freq phase alignment')
t('cos')

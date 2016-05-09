var test = require('tst');
var Oscillator = require('./');
var Slice = require('audio-slice');
var Speaker = require('audio-speaker');

test('Sine', function () {
	Oscillator({
		type: 'sine'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

test('Triangle', function () {
	Oscillator({
		type: 'triangle'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

test('Square', function () {
	Oscillator({
		type: 'square'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

test('Pulse', function () {
	Oscillator({
		type: 'pulse'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

test('Saw', function () {
	Oscillator({
		type: 'saw'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});

test('setPeriodicWave', function () {
	Oscillator({
		type: 'wave',
		normalize: true
	})
	.setPeriodicWave([0, 1, 0, 0], [0, 1, 1, 1])
	.pipe(Slice(2))
	.pipe(Speaker())
});

test.only('Detune', function () {
	Oscillator({
		type: 'saw'
	})
	.pipe(Slice(2))
	.pipe(Speaker())
});
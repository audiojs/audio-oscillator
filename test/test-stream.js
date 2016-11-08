var test = require('tst');
var Oscillator = require('../stream');
var Slice = require('audio-slice');
var Speaker = require('audio-speaker/stream');

test('Sine', function () {
	Oscillator({
		type: 'sine'
	})
	// .pipe(Slice(2))
	.pipe(Speaker())
});

// test('Triangle', function () {
// 	Oscillator({
// 		type: 'triangle'
// 	})
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });
//
// test('Square', function () {
// 	Oscillator({
// 		type: 'square'
// 	})
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });
//
// test('Pulse', function () {
// 	Oscillator({
// 		type: 'pulse'
// 	})
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });
//
// test('Saw', function () {
// 	Oscillator({
// 		type: 'saw'
// 	})
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });
//
// test('setWave', function () {
// 	Oscillator({
// 		normalize: true
// 	})
// 	.setWave('periodic', [0, 1, 0, 0], [0, 1, 1, 1])
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });
//
// test('Detune', function () {
// 	Oscillator({
// 		type: 'saw',
// 		detune: 50
// 	})
// 	.pipe(Slice(2))
// 	.pipe(Speaker())
// });

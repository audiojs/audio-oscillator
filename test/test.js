var test = require('tst');
var oscillator = require('../');
var speaker = require('audio-speaker');

test('Sine', function () {
  oscillator({ frequency: 400 })(speaker())
})

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
// test('setPeriodicWave', function () {
// 	Oscillator({
// 		type: 'wave',
// 		normalize: true
// 	})
// 	.setPeriodicWave([0, 1, 0, 0], [0, 1, 1, 1])
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

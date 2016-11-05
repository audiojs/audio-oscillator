var test = require('tst');
var pull = require('pull-stream')
var oscillator = require('../pull');
var speaker = require('audio-speaker/pull');

test('Sine', function () {
  pull(
    oscillator({ frequency: 400 }),
    speaker()
  )
})

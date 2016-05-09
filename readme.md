Oscillate some periodic wave into stream. [OscillatorNode](http://webaudio.github.io/web-audio-api/#the-oscillatornode-interface) in stream land.

## Usage

[![$ npm install audio-oscillator](http://nodei.co/npm/audio-oscillator.png?mini=true)](http://npmjs.org/package/audio-oscillator)

```js
var Oscillator = require('audio-oscillator');
var Speaker = require('audio-speaker');
var Slice = require('audio-slice');

Oscillator({
	//in hz
	frequency: 440,

	//in cents
	detune: 0,

	//sine, triangle, square, saw, pulse, wave
	type: 'sine',

	//normalize result of `wave` type
	normalize: true
})
.pipe(Slice(1))
.pipe(Speaker());


//Set periodic wave from arrays of real and imaginary coefficients
oscillator.setPeriodicWave(real, imag);
```

## Related

> [audio-generator](https://github.com/audio-lab/audio-generator) — generate audio stream with a function.<br/>
> [audio-speaker](https://github.com/audio-lab/audio-speaker) — output audio stream to speaker in node/browser.<br/>
> [web-audio-stream](https://github.com/audio-lab/web-audio-stream) — stream to web-audio node.<br/>

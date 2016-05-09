Oscillate some periodic wave into stream. [OscillatorNode](http://webaudio.github.io/web-audio-api/#the-oscillatornode-interface) in stream land.

## Usage

```js
var Oscillator = require('audio-oscillator');
var Speaker = require('audio-speaker');
var Slice = require('audio-slice');

Oscillator({
	frequency: 440,
	detune: 0,
	type: 'sine',
	normalize: true
})
.pipe(Slice(1))
.pipe(Speaker());


//Set periodic wave from arrays of real and imaginary coefficients
Oscillator.setPeriodicWave(real, imag);
```

## Related

> [audio-generator](https://github.com/audio-lab/audio-generator) — generate audio stream with a function.
> [audio-speaker](https://github.com/audio-lab/audio-speaker) — output audio stream to speaker in node/browser.
> [web-audio-stream](https://github.com/audio-lab/web-audio-stream) — stream to web-audio node.

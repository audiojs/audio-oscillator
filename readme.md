# audio-oscillator [![Build Status](https://travis-ci.org/audiojs/audio-oscillator.svg?branch=master)](https://travis-ci.org/audiojs/audio-oscillator) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Fill array/buffer with periodic oscillation.

## Usage

[![$ npm install audio-oscillator](http://nodei.co/npm/audio-oscillator.png?mini=true)](http://npmjs.org/package/audio-oscillator)

```js
var createOscillator = require('audio-oscillator');
var createSpeaker = require('audio-speaker');

let oscillate = createOscillator({frequency: 440, type: 'saw'})
let output = createSpeaker()

//output oscillated sawtooth wave to speaker
(function tick(error) {
	let audioBuffer = oscillate(1024)
	output(audioBuffer, tick)
})()
```

## API

### oscillate = createOscillator(options?)

Creatie oscillator function based on the `options`:

| Property | Default | Meaning |
|---|---|---|
| `frequency` | `440` | Frequency of oscillations, in Hertz. Can be a function with `(time, params) => freq` signature called once per `oscillate`. |
| `detune` | `0` | Detune of oscillations `-100...+100`, in cents. Can be a function with `(time, params) => detune` signature called once per `oscillate`. |
| `type` | `'sine'` | [Periodic waveform](https://github.com/scijs/periodic-waveform) name or function with `(t, params) => val` signature. |
| `sampleRate` | `44100` | Output data `sampleRate`. |
| `channels` | `1` | Output data number of channels. |
| `dtype` | `'audiobuffer'` | Output data format, eg. `'uint8 interleaved'`, `'float32 planar'` etc. See [audio-format](https://github.com/audiojs/audio-format). |

#### Types

Some periodic functions may provide additional parameters, which can be additionally passed to `options`. Every additional param may be a function with `(time, params) => value` signature, called once per `oscillate`.

| Type | Meaning | Parameters |
|---|---|---|
| `sine`, `sin` | Sine wave. | `phase=0` |
| `cosine`, `cos` | Cosine wave, same as `sine` with `phase=0.25` | `phase=0` |
| `saw`, `sawtooth` | Sawtooth wave. | `inversed=false` |
| `tri`, `triangle` | Triangular wave. | `ratio=0.5` |
| `rect`, `rectangle`, `sqr`, `square` | Rectangular wave. | `ratio=0.5` |
| `delta`, `pulse` | 1-sample pulse. | |
| `series`, `fourier`, `harmonics` | Fourier series, see [PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave). | `real=[0, 1]`, `imag=[0, 0]` and `normalize=true`. |
| `clausen` | Clausen function. | `limit=10` |
| `step` | Step function on a sample set. | `samples=[...]` |
| `interpolate` | Interpolate function on a sample set. | `samples=[...]` |
| `noise` | Repeated noise fragment. | `` |


### buffer = oscillate(buffer|length=1024, params?)

Fill passed audio buffer/array or create a new one of the `length` with oscillated wave. Optionally provide params with `{frequency, detune, ...}` properties.

## Examples

```js
// Output float32 arrays
let sine = createOscillator({
	type: 'sine',
	dtype: 'float32 planar',
	channels: 2
})
let samples = sine(1024) //samples.length == 2048


// Change params dynamically
let tri = createOscillator({
	type: 'triangle',
	frequency: (t, ctx) => t/100,
	sampleRate: 8000,
	dtype: 'uint8'
})

let arr0 = tri(1024, {ratio: .3})
let arr1 = tri(1024, {ratio: .4})
let arr2 = tri(1024, {ratio: .5})
```


## Related

> [audio-generator](https://github.com/audiojs/audio-generator) − generate audio with a function.<br/>
> [audio-speaker](https://github.com/audiojs/audio-speaker) − output audio to speaker in node/browser.<br/>
> [web-audio-write](https://github.com/audiojs/web-audio-write) − write to web-audio node.<br/>
> [periodic-function](https://github.com/dfcreative/periodic-function) − a collection of periodic functions.<br/>

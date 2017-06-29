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
| `type` | `'sine'` | [Periodic waveform](https://github.com/scijs/periodic-waveform) name or function with `(t, ctx) => val` signature. |
| `frequency` | `440` | Frequency of oscillations, in Hertz. Can be A-rate function with `(time, ctx) => freq` signature. |
| `detune` | `0` | Detune of oscillations `-100...+100`, in cents. Can be A-rate function with `(time, ctx) => detune` signature. |
| `sampleRate` | `44100` | Output data sample rate. |
| `channels` | `1` | Output data number of channels. |
| `dtype` | `'audiobuffer'` | Output data format, eg. `'uint8 interleaved'`, `'float32 planar'` etc. See [audio-format](https://github.com/audiojs/audio-format). |

#### Types

Some periodic functions may provide additional parameters, which can be passed to `options`. Every parameter can also be an A-rate function with `(time, ctx) => value` signature, called once per `oscillate`.

| Type | Meaning | Parameters |
|---|---|---|
| `'sine'`, `'sin'` | ![sine](https://raw.githubusercontent.com/dfcreative/periodic-function/master/sine.png) Sine wave. | `phase=0` |
| `'cosine'`, `'cos'` | Cosine wave, same as `sine` with `phase=0.25`. | `phase=0` |
| `'saw'`, `'sawtooth'` | ![sawtooth](https://raw.githubusercontent.com/dfcreative/periodic-function/master/sawtooth.png) Sawtooth wave. | `inversed=false` |
| `'tri'`, `'triangle'` | ![triangle](https://raw.githubusercontent.com/dfcreative/periodic-function/master/triangle.png) Triangular wave. | `ratio=0.5` |
| `'rect'`, `'rectangle'`, `'sqr'`, `'square'` | ![square](https://raw.githubusercontent.com/dfcreative/periodic-function/master/square.png) Rectangular wave. | `ratio=0.5` |
| `'delta'`, `'pulse'` | ![pulse](https://raw.githubusercontent.com/dfcreative/periodic-function/master/pulse.png) 1-sample pulse. | |
| `'series'`, `'fourier'`, `'harmonics'` | ![fourier](https://raw.githubusercontent.com/dfcreative/periodic-function/master/fourier.png) Fourier series, see [PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave). | `real=[0, 1]`, `imag=[0, 0]` and `normalize=true`. |
| `'clausen'` | ![clausen](https://raw.githubusercontent.com/dfcreative/periodic-function/master/clausen.png) Clausen function. | `limit=10` |
| `'step'` | ![step](https://raw.githubusercontent.com/dfcreative/periodic-function/master/step.png) Step function on a sample set. | `samples=[...]` |
| `'interpolate'` | ![interpolate](https://raw.githubusercontent.com/dfcreative/periodic-function/master/interpolate.png) Interpolate function on a sample set. | `samples=[...]` |
| `'noise'` | ![noise](https://raw.githubusercontent.com/dfcreative/periodic-function/master/noise.png) Repeated noise fragment. |  |

#### A-rate params

If parameters are functions, they are evaluated every `oscillate` call and receive `(t, ctx)` arguments and expected to return a plain value. `ctx` is an object with the following properties:

| Property | Meaning |
|---|---|
| `count` | Current frame offset in samples. |
| `time` | Current frame start time. |
| `t` | Current amount of turn, `0..1`. |
| `frequency` | Last frame frequency. |
| `detune` | Last frame detune. |
| `sampleRate` | Static value, sample rate. |
| `channels` | Static value, channels. |
| `type` | Current type of generator. |
| `...params` | Custom params for generator function. |

### buffer = oscillate(buffer|length=1024, options?)

Fill passed audio buffer/array or create a new one of the `length` with oscillated wave. Optionally provide `options` object with `{frequency, detune, ...params}` properties.

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

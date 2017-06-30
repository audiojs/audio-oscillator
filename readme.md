# audio-oscillator [![Build Status](https://travis-ci.org/audiojs/audio-oscillator.svg?branch=master)](https://travis-ci.org/audiojs/audio-oscillator) [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges) 
[![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-oscillator.svg)](https://greenkeeper.io/)

Fill array/buffer with periodic oscillation.

## Usage

[![$ npm install audio-oscillator](http://nodei.co/npm/audio-oscillator.png?mini=true)](http://npmjs.org/package/audio-oscillator)

```js
var createOscillator = require('audio-oscillator');
var createSpeaker = require('audio-speaker');

let oscillate = createOscillator({frequency: 440, type: 'saw'})
let output = createSpeaker()

// output oscillated sawtooth wave to speaker
(function tick(error) {
  let audioBuffer = oscillate(1024)
  output(audioBuffer, tick)
})()
```

## API

### oscillate = createOscillator(options?)

Creatie oscillator function based on the `options`.

```js
// simple sine oscillator
let sine = createOscillator({type: 'sine', frequency: 1000})
let abuf = sine()

// triangular oscillator with plain array output
let tri = createOscillator({type: 'triangle', ratio: 0.2, dtype: 'array', frequency: 200})
let arr = tri()

// stereo oscillations
let rect = createOscillator({type: 'rect', channels: 2, frequency: 1000})
let abuf2 = rect()

// custom harmonics oscillations to uint8 output
let timbre = createOscillator({type: 'series', real: [0, 1, 0, .5], dtype: 'uint8'})
let uint8arr = timbre()

// oscillator with dynamic params
let seq = createOscillator({
  type: 'step',
  samples: [0,0,.5,1,1,.5],
  frequency: 1000,
  detune: (t, ctx) => t*0.01
})
let abuf4 = seq()
```

#### Options

| Property | Default | Meaning |
|---|---|---|
| `type` | `'sine'` | [Periodic waveform](https://github.com/scijs/periodic-waveform) name or K-rate function with `ctx => val` signature. |
| `frequency` | `440` | Frequency of oscillations, in Hertz. Can be A-rate function with `ctx => freq` signature. |
| `detune` | `0` | Detune of oscillations `-100...+100`, in cents. Can be A-rate function with `ctx => detune` signature. |
| `sampleRate` | `44100` | Output data sample rate. |
| `channels` | `1` | Output data number of channels. |
| `dtype` | `'audiobuffer'` | Output data format, eg. `'uint8 interleaved'`, `'float32 planar'`, `'array'` etc. See [audio-format](https://github.com/audiojs/audio-format). |

#### Types

Some periodic functions may provide additional parameters, which can be passed to `options`. Every parameter can also be an A-rate function with `(time, ctx) => value` signature.

| Type | Waveshape | Meaning | Parameters |
|---|:---:|---|---|
| `'sine'`, `'sin'` | ![sine](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/sine.png) | Sine wave. | `phase=0` |
| `'cosine'`, `'cos'` | ![cosine](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/cosine.png) | Cosine wave, same as `sine` with `phase=0.25`. | `phase=0` |
| `'saw'`, `'sawtooth'` | ![sawtooth](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/sawtooth.png) | Sawtooth wave. | `inversed=false` |
| `'tri'`, `'triangle'` | ![triangle](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/triangle.png) | Triangular wave. | `ratio=0.5` |
| `'rect'`, `'rectangle'`, `'quad'`, `'square'` | ![square](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/square.png) | Rectangular wave. | `ratio=0.5` |
| `'delta'`, `'pulse'` | ![pulse](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/pulse.png) | 1-sample pulse. | |
| `'series'`, `'fourier'`, `'harmonics'`, `'periodic'` | ![fourier](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/fourier.png) | Fourier series, see [PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave). | `real=[0, 1]`, `imag=[0, 0]` and `normalize=true`. |
| `'clausen'` | ![clausen](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/clausen.png) | Clausen function. | `limit=10` |
| `'step'` | ![step](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/step.png) | Step function on a sample set. | `samples=[...]` |
| `'interpolate'` | ![interpolate](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/interpolate.png) | Interpolate function on a sample set. | `samples=[...]` |
| `'noise'` | ![noise](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/noise.png) | Repeated noise fragment. |  |
| `function` | ? | Custom generating function with `ctx => value` signature, called for every sample. | |

#### A-rate params

If parameters are functions, they are evaluated every `oscillate` call with `ctx` argument and expected to return a plain value. `ctx` is an object with the following properties:

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

```js
// Output float32 interleaved arrays
let sine = createOscillator({
  type: 'sine',
  dtype: 'float32 interleaved',
  channels: 4,
  sampleRate: 96000
})
let samples = sine(1024) //samples.length == 8192


// Change params dynamically
let tri = createOscillator({
  type: 'triangle',
  frequency: 1000,
  sampleRate: 8000,
  dtype: 'uint8'
})
let arr = new Uint8Array(1024)
tri(arr, {ratio: .3})
tri(arr, {ratio: .4})
tri(arr, {ratio: .5})
```


## Related

* [audio-generator](https://github.com/audiojs/audio-generator) − generate audio with a function.<br/>
* [audio-speaker](https://github.com/audiojs/audio-speaker) − output audio to speaker in node/browser.<br/>
* [web-audio-write](https://github.com/audiojs/web-audio-write) − write to web-audio node.<br/>
* [periodic-function](https://github.com/dfcreative/periodic-function) − a collection of periodic functions.<br/>

## License

© 2017 Dima Yv. MIT License

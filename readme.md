# audio-oscillator [![Build Status](https://travis-ci.org/audiojs/audio-oscillator.svg?branch=master)](https://travis-ci.org/audiojs/audio-oscillator) [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges) [![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-oscillator.svg)](https://greenkeeper.io/)

Generate periodic oscillation data.

## Usage

[![$ npm install audio-oscillator](http://nodei.co/npm/audio-oscillator.png?mini=true)](http://npmjs.org/package/audio-oscillator)

```js
const oscillate = require('audio-oscillator/sine')
const output = require('web-audio-write')()

// render sine sound stream
;(async function frame() {
  await output(oscillate(new ArrayBuffer({
    channels: 2, sampleRate: 44100, length: 1024
  }), 440))
  frame()
})()
```


## API

### `let array = oscillate.<waveform>(length=1024|dst, frequency=440|options?)`

Generate [periodic-function](https://ghub.io/periodic-function) `waveform` samples into a `dst` float array / array of arrays / _AudioBuffer_. If `length` is provided, a new mono `array` is created. The phase of consequently generated chunks is aligned, if the same array is passed multiple times.

```js
let oscillate = require('audio-oscillator')

let samples = new Float64Array(1024)

oscillate.sine(samples, 440)

// output array has additional properties of the data
// samples.phase, samples.frequency, samples.detune, samples.sampleRate

// next data phase is aligned with the previous data
oscillate.sine(samples)
```

#### `options`

Property | Default | Meaning
---|---|---
`frequency`, `f` | `440` | Frequency of oscillations, in Hz.
`detune` | `0` | Detune of oscillations `-100...+100`, in cents.
`phase`, `t` | `0` | Normalized initial phase of waveform, `0..1`.
`sampleRate`, `rate` | `44100` | Sample rate of output data.


#### `waveform`

Available waveforms with their additional options:

Type | Waveshape | Parameters
---|---|---
`'sin'` | ![sine](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/sine.png) |
`'cos'` | ![cosine](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/cosine.png) |
`'saw'` | ![sawtooth](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/sawtooth.png) | `inverse=false`
`'tri'` | ![triangle](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/triangle.png) | `ratio=0.5`
`'rect'` | ![square](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/square.png) | `ratio=0.5`
`'series'` | ![fourier](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/fourier.png) | `real=[0, 1]`, `imag=[0, 0]`, `normalize=true`
`'clausen'` | ![clausen](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/clausen.png) | `limit=10`
`'step'` | ![step](https://raw.githubusercontent.com/dfcreative/periodic-function/master/img/step.png) | `samples=10`


## Related

* [periodic-function](https://github.com/scijs/periodic-function) − a collection of periodic functions.

## License

© 2017 Dmitry Yv. MIT License

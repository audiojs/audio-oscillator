/**
 * @module  audio-oscillator
 */
'use strict';

const through = require('audio-through')
const periodic = require('periodic-function')
const defined = require('defined')
const pick = require('pick-by-alias')
const extend = require('object-assign')

module.exports = createOscillator


function createOscillator (options) {
	if (!options) options = {}

	// register a-rate param
	let param = {
		frequency: 432,
		detune: 0,
		type: 'sin'
	}, generate


	// fill passed source with oscillated data
	let oscillate = through((data, state, opts) => {
		if (opts) update(opts)

		// evaluate a-params
		for (let name in param) {
			let p = param[name]
			state[name] = p && p.call ? p(state) : p
		}

		let {frequency, detune, sampleRate, time} = state
		let period = sampleRate / (frequency * Math.pow(2, detune / 1200))

		// correct freq/detune change
		if (period !== state.period) {
			if (state.period != null) {
				state.shift = state.t - (state.count % period) / period
			}
			else {
				state.shift = 0
			}
			state.period = period
		}

		// fill channels
		let count = state.count
		for (let i = 0, l = data[0].length; i < l; i++) {
			state.t = (count % period) / period + state.shift
			for (let c = 0, cnum = data.length; c < cnum; c++) {
				let sample = generate(state)
				data[c][i] = sample
			}
			count++
		}

		return data
	}, options)

	oscillate.update = update
	update(options)


	return oscillate


	// update params
	function update (opts) {
		opts = pick(opts, {
			type: 'type waveform wave kind',
			frequency: 'frequency freq f',
			detune: 'detune',
			inverse: 'inverse inversed',
			imag: 'imag imaginary im',
			real: 'real re',
			normalize: 'normalize normalized',
			phase: 'phase shift ψ φ',
			ratio: 'ratio fraction',
			samples: 'samples values steps'
		}, true)

		extend(param, opts)

		// figure out generator function
		switch (param.type) {
			case 'saw':
			case 'sawtooth':
				param.inverse = defined(opts.inverse, param.inverse, false)
				generate = state => periodic.sawtooth(state.t, state.inverse)
				break;
			case 'delta':
			case 'pulse':
				generate = state => periodic.pulse(state.t)
				break;
			case 'tri':
			case 'triangle':
				param.ratio = defined(opts.ratio, param.ratio, 0.5)
				generate = state => periodic.triangle(state.t, state.ratio)
				break;
			case 'square':
			case 'quad':
			case 'rect':
			case 'rectangle':
				param.ratio = defined(opts.ratio, param.ratio, 0.5)
				generate = state => periodic.square(state.t, state.ratio)
				break;
			case 'series':
			case 'periodic':
			case 'harmonics':
			case 'fourier':
				param.real = defined(opts.real, param.real, [0, 1])
				param.imag = defined(opts.imag, param.imag, null)
				param.normalize = defined(opts.normalize, param.normalize, true)
				generate = state => periodic.fourier(state.t, state.real, state.imag, state.normalize)
				break;
			case 'cos':
			case 'cosine':
				param.phase = defined(opts.phase, param.phase, 0)
				generate = state => periodic.sine(state.t + state.phase + .25)
				break;
			case 'sin':
			case 'sine':
			case 'sinus':
				param.phase = defined(opts.phase, param.phase, 0)
				generate = state => periodic.sine(state.t + state.phase)
				break;
			case 'step':
			case 'samples':
				param.samples = defined(opts.samples, param.samples, [0])
				generate = state => periodic.step(state.t, state.samples)
				break;
			case 'inter':
			case 'interpolate':
			case 'values':
				param.samples = defined(opts.samples, param.samples, [0])
				generate = state => periodic.interpolate(state.t, state.samples)
				break;
			case 'clausen':
				generate = state => periodic.clausen(state.t)
				break;
			default:
				if (typeof type === 'string') {
					let fn = periodic[type]
					generate = state => fn(state.t)
				}
				else generate = param.type
		}
	}
}

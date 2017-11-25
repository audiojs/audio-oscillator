/**
 * @module  audio-oscillator
 */
'use strict';

const periodic = require('periodic-function')
const convert = require('pcm-convert')
const aformat = require('audio-format')
const createBuffer = require('audio-buffer-from')
const isAudioBuffer = require('is-audio-buffer')
const defined = require('defined')
const pick = require('pick-by-alias')

module.exports = createOscillator


/**
 * @constructor
 */
function createOscillator (options) {
	if (!options) options = {}

	options = unalias(options)

	let format = defined(options.format, 'array')

	format = typeof format === 'string' ? aformat.parse(format) : aformat.detect(format)

	//oscillating context
	let state = {
		type: defined(options.type, 'sine'),
		count: 0,
		time: 0,
		t: 0,
		adjust: 0,
		period: 0
	}

	state.sampleRate = format.sampleRate = defined(options.sampleRate, format.sampleRate, 44100)
	state.channels = format.channels = defined(options.channels, format.channels, 1)
	state.samplesPerFrame = defined(options.length, 1024)

	//register a-rate param
	let aParams = {}, reservedName = Object.keys(state)

	aParams.frequency = defined(options.frequency, 440)
	aParams.detune = defined(options.detune, 0)

	//figure out generator function
	let generate
	switch (state.type) {
		case 'saw':
		case 'sawtooth':
			aParams.inverse = defined(options.inverse, false)
			generate = state => periodic.sawtooth(state.t, state.inverse)
			break;
		case 'delta':
		case 'pulse':
			generate = state => periodic.pulse(state.t)
			break;
		case 'tri':
		case 'triangle':
			aParams.ratio = defined(options.ratio, 0.5)
			generate = state => periodic.triangle(state.t, state.ratio)
			break;
		case 'square':
		case 'quad':
		case 'rect':
		case 'rectangle':
			aParams.ratio = defined(options.ratio, 0.5)
			generate = state => periodic.square(state.t, state.ratio)
			break;
		case 'series':
		case 'periodic':
		case 'harmonics':
		case 'fourier':
			aParams.real = defined(options.real, [0, 1])
			aParams.imag = defined(options.imag, null)
			aParams.normalize = defined(options.normalize, true)
			generate = state => periodic.fourier(state.t, state.real, state.imag, state.normalize)
			break;
		case 'cos':
		case 'cosine':
			aParams.phase = defined(options.phase, 0)
			generate = state => periodic.sine(state.t + state.phase + .25)
			break;
		case 'sin':
		case 'sine':
			aParams.phase = defined(options.phase, 0)
			generate = state => periodic.sine(state.t + state.phase)
			break;
		case 'step':
		case 'samples':
			aParams.samples = defined(options.samples, [0])
			generate = state => periodic.step(state.t, state.samples)
			break;
		case 'inter':
		case 'interpolate':
		case 'values':
			aParams.samples = defined(options.samples, [0])
			generate = state => periodic.interpolate(state.t, state.samples)
			break;
		case 'clausen':

		default:
			if (typeof state.type === 'string') {
				let fn = periodic[state.type]
				generate = state => fn(state.t)
			}
			else generate = state.type
	}



	//fill passed source with oscillated data
	function oscillate (dst, params) {
		let buf = dst

		if (buf == null) buf = state.samplesPerFrame

		//make sure we deal with audio buffer
		if (!isAudioBuffer(buf)) {
			buf = createBuffer(buf, format)
		}

		//take over new passed params
		if (params) {
			params = unalias(params)

			for (let name in params) {
				if (reservedName.indexOf(name) >= 0) {
					state[name] = params[name]
				}
				else {
					aParams[name] = defined(params[name], state[name])
				}
			}
		}

		//evaluate context
		for (let name in aParams) {
			let p = aParams[name]
			state[name] = p && p.call ? p(state) : p
		}

		let frequency = state.frequency
		let detune = state.detune
		let sampleRate = buf.sampleRate
		let period = sampleRate / (frequency * Math.pow(2, detune / 1200))

		//correct freq/detune change
		if (period != state.period) {
			if (state.period) {
				state.adjust = state.t - (state.count % period) / period
			}
			state.period = period
		}

		//fill channels
		let data = [], cnum = buf.numberOfChannels
		for (let c = 0; c < cnum; c++) {
			data[c] = buf.getChannelData(c)
		}
		for (let i = 0, l = buf.length; i < l; i++) {
			state.time = (state.count) / sampleRate
			state.t = (state.count % period) / period + state.adjust
			for (let c = 0; c < cnum; c++) {
				data[c][i] = generate(state)
			}
			state.count++
		}

		//convert to target dtype
		if (format.type === 'audiobuffer') return buf
		if (dst && dst.length) return convert(buf, format, dst)
		return convert(buf, format)
	}

	return oscillate
}

function unalias(options) {
	return pick(options, {
		type: 'type waveform wave kind',
		sampleRate: 'sampleRate rate',
		channels: 'channels channel numberOfChannels',
		samplesPerFrame: 'samplesPerFrame length frame block blockSize blockLength frameSize frameLength',
		frequency: 'frequency freq f',
		detune: 'detune',
		inverse: 'inverse inversed',
		imag: 'imag imaginary im',
		real: 'real re',
		normalize: 'normalize normalized',
		phase: 'phase shift ψ',
		ratio: 'ratio fraction',
		samples: 'samples values steps',
		format: 'dtype dataType format container',
		t: 'time t'
	}, true)
}

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

module.exports = createOscillator


/**
 * @constructor
 */
function createOscillator (options) {
	if (!options) options = {}

	let format = defined(options.format, options.dtype, options.container, 'array')

	format = typeof format === 'string' ? aformat.parse(format) : aformat.detect(format)

	//oscillating context
	let ctx = {
		type: defined(options.type, 'sine'),
		count: 0,
		time: 0,
		t: 0,
		adjust: 0,
		period: 0
	}

	ctx.sampleRate = format.sampleRate = defined(options.sampleRate, options.rate, format.sampleRate, 44100)
	ctx.channels = format.channels = defined(options.channels, format.channels, 1)
	ctx.samplesPerFrame = defined(options.length, options.samplesPerFrame, options.frame, options.block, options.samplesPerFrame, options.blockLength, options.frameSize, options.frameLength, 1024)

	//register a-rate param
	let aParams = {}, reservedName = Object.keys(ctx)

	aParams.frequency = defined(options.f, options.freq, options.frequency, 440)
	aParams.detune = defined(options.detune, 0)

	//figure out generator function
	let generate
	switch (ctx.type) {
		case 'saw':
		case 'sawtooth':
			aParams.inversed = defined(options.inversed, options.inverse, false)
			generate = ctx => periodic.sawtooth(ctx.t, ctx.inversed)
			break;
		case 'delta':
		case 'pulse':
			generate = ctx => periodic.pulse(ctx.t)
			break;
		case 'tri':
		case 'triangle':
			aParams.ratio = defined(options.ratio, 0.5)
			generate = ctx => periodic.triangle(ctx.t, ctx.ratio)
			break;
		case 'square':
		case 'quad':
		case 'rect':
		case 'rectangle':
			aParams.ratio = defined(options.ratio, 0.5)
			generate = ctx => periodic.square(ctx.t, ctx.ratio)
			break;
		case 'series':
		case 'periodic':
		case 'harmonics':
		case 'fourier':
			aParams.real = defined(options.real, [0, 1])
			aParams.imag = defined(options.imag, options.imaginary, null)
			aParams.normalize = defined(options.normalize, true)
			generate = ctx => periodic.fourier(ctx.t, ctx.real, ctx.imag, ctx.normalize)
			break;
		case 'cos':
		case 'cosine':
			aParams.phase = defined(options.phase, options.shift, 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase + .25)
			break;
		case 'sin':
		case 'sine':
			aParams.phase = defined(options.phase, options.shift, 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase)
			break;
		case 'step':
		case 'samples':
			aParams.samples = defined(options.samples, [0])
			generate = ctx => periodic.step(ctx.t, ctx.samples)
			break;
		case 'inter':
		case 'interpolate':
		case 'values':
			aParams.samples = defined(options.samples, [0])
			generate = ctx => periodic.interpolate(ctx.t, ctx.samples)
			break;
		case 'clausen':

		default:
			if (typeof ctx.type === 'string') {
				let fn = periodic[ctx.type]
				generate = ctx => fn(ctx.t)
			}
			else generate = ctx.type
	}



	//fill passed source with oscillated data
	function oscillate (dst, params) {
		let buf = dst

		if (buf == null) buf = ctx.samplesPerFrame

		//make sure we deal with audio buffer
		if (!isAudioBuffer(buf)) {
			buf = createBuffer(buf, format)
		}

		//take over new passed params
		if (params) {
			for (let name in params) {
				if (reservedName.indexOf(name) >= 0) {
					ctx[name] = params[name]
				}
				else {
					aParams[name] = defined(params[name], ctx[name])
				}
			}
		}

		//evaluate context
		for (let name in aParams) {
			let p = aParams[name]
			ctx[name] = p && p.call ? p(ctx) : p
		}

		let frequency = ctx.frequency
		let detune = ctx.detune
		let sampleRate = buf.sampleRate
		let period = sampleRate / (frequency * Math.pow(2, detune / 1200))

		//correct freq/detune change
		if (period != ctx.period) {
			if (ctx.period) {
				ctx.adjust = ctx.t - (ctx.count % period) / period
			}
			ctx.period = period
		}

		//fill channels
		let data = [], cnum = buf.numberOfChannels
		for (let c = 0; c < cnum; c++) {
			data[c] = buf.getChannelData(c)
		}
		for (let i = 0, l = buf.length; i < l; i++) {
			ctx.time = (ctx.count) / sampleRate
			ctx.t = (ctx.count % period) / period + ctx.adjust
			for (let c = 0; c < cnum; c++) {
				data[c][i] = generate(ctx)
			}
			ctx.count++
		}

		//convert to target dtype
		if (format.type === 'audiobuffer') return buf
		if (dst && dst.length) return convert(buf, format, dst)
		return convert(buf, format)
	}

	return oscillate
}


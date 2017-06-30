/**
 * @module  audio-oscillator
 */
'use strict';

const periodic = require('periodic-function')
const convert = require('pcm-convert')
const aformat = require('audio-format')
const createBuffer = require('audio-buffer-from')
const isAudioBuffer = require('is-audio-buffer')
const assert = require('assert')
const extend = require('object-assign')

module.exports = createOscillator


/**
 * @constructor
 */
function createOscillator (options) {
	if (!options) options = {}

	let format = options.dtype || 'audiobuffer'

	format = typeof format === 'string' ? aformat.parse(format) : aformat.detect(format)

	//oscillating context
	let ctx = {
		type: options.type || 'sine',
		count: 0,
		time: 0,
		t: 0
	}

	ctx.sampleRate = format.sampleRate = options.sampleRate || format.sampleRate || 44100
	ctx.channels = format.channels = options.channels || format.channels || 1

	//register a-rate param
	let aParams = {}, reserved = Object.keys(ctx)
	function aParam (name, opts, dflt) {
		if (reserved.indexOf(name) >= 0) return
		let val = opts[name] !== undefined ? opts[name] : dflt
		aParams[name] = val
	}

	aParam('frequency', options, 440)
	aParam('detune', options, 0)

	//figure out generator function
	let generate
	switch (ctx.type) {
		case 'saw':
		case 'sawtooth':
			aParam('inversed', options, false)
			generate = ctx => periodic.sawtooth(ctx.t, ctx.inversed)
			break;
		case 'delta':
		case 'pulse':
			generate = ctx => periodic.pulse(ctx.t)
			break;
		case 'tri':
		case 'triangle':
			aParam('ratio', options, 0.5)
			generate = ctx => periodic.triangle(ctx.t, ctx.ratio)
			break;
		case 'square':
		case 'quad':
		case 'rect':
		case 'rectangle':
			aParam('ratio', options, 0.5)
			generate = ctx => periodic.square(ctx.t, ctx.ratio)
			break;
		case 'series':
		case 'periodic':
		case 'harmonics':
		case 'fourier':
			aParam('real', options, [0, 1])
			aParam('imag', options, null)
			aParam('normalize', options, true)
			generate = ctx => periodic.fourier(ctx.t, ctx.real, ctx.imag, ctx.normalize)
			break;
		case 'cos':
		case 'cosine':
			aParam('phase', options, 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase + .25)
			break;
		case 'sin':
		case 'sine':
			aParam('phase', options, 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase)
			break;
		case 'step':
		case 'samples':
			aParam('samples', options, [0])
			generate = ctx => periodic.step(ctx.t, ctx.samples)
			break;
		case 'inter':
		case 'interpolate':
		case 'values':
			aParam('samples', options, [0])
			generate = ctx => periodic.interpolate(ctx.t, ctx.samples)
			break;
		default:
			if (typeof ctx.type === 'string') {
				let fn = periodic[ctx.type]
				generate = ctx => fn(ctx.t)
			}
			else generate = ctx.type
	}

	assert(generate, 'Unrecognized type of function')


	let lastPeriod, adjust = 0

	//fill passed source with oscillated data
	function oscillate (dst, params) {
		let buf = dst

		if (buf == null) buf = 1024

		//make sure we deal with audio buffer
		if (!isAudioBuffer(buf)) {
			buf = createBuffer(buf, format)
		}

		//take over new passed params
		if (params) {
			for (let name in params) {
				aParam(name, params, ctx[name])
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

		//correct phase change
		if (period != lastPeriod) {
			if (lastPeriod) {
				adjust = ctx.t - (ctx.count % period) / period
			}
			lastPeriod = period
		}

		//fill channels
		for (let c = 0, l = buf.length; c < buf.numberOfChannels; c++) {
			let arr = buf.getChannelData(c)
			for (let i = 0; i < l; i++) {
				ctx.time = (ctx.count) / sampleRate
				ctx.t = (ctx.count % period) / period + adjust
				arr[i] = generate(ctx)
				ctx.count++
			}
		}

		//convert to target dtype
		if (format.type === 'audiobuffer') return buf
		if (dst.length) return convert(buf, format, dst)
		return convert(buf, format)
	}

	return oscillate
}


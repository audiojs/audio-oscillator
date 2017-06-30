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
	let ctx = extend({}, options, {
		count: 0,
		time: 0,
		t: 0
	})

	if (!ctx.type) ctx.type = 'sine'
	if (!ctx.frequency) ctx.frequency = 440
	if (!ctx.detune) ctx.detune = 0
	ctx.sampleRate = format.sampleRate = format.sampleRate || ctx.sampleRate || 44100
	ctx.channels = format.channels = format.channels || ctx.channels || 1

	//registered a-rate params
	let aParams = {}
	function aParam (name, dflt) {
		let val = options[name] != null ? options[name] : dflt
		aParams[name] = val
	}


	//figure out generator function
	let generate
	switch (ctx.type) {
		case 'saw':
		case 'sawtooth':
			aParam('inversed', false)
			generate = ctx => periodic.sawtooth(ctx.t, ctx.inversed)
			break;
		case 'delta':
		case 'pulse':
			generate = ctx => periodic.pulse(ctx.t)
			break;
		case 'tri':
		case 'triangle':
			aParam('ratio', 0.5)
			generate = ctx => periodic.triangle(ctx.t, ctx.ratio)
			break;
		case 'square':
		case 'quad':
		case 'rect':
		case 'rectangle':
			aParam('ratio', 0.5)
			generate = ctx => periodic.square(ctx.t, ctx.ratio)
			break;
		case 'series':
		case 'periodic':
		case 'harmonics':
		case 'fourier':
			aParam('real', [0, 1])
			aParam('imag', null)
			aParam('normalize', true)
			generate = ctx => periodic.fourier(ctx.t, ctx.real, ctx.imag, ctx.normalize)
			break;
		case 'cos':
		case 'cosine':
			aParam('phase', 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase + .25)
			break;
		case 'sin':
		case 'sine':
			aParam('phase', 0)
			generate = ctx => periodic.sine(ctx.t + ctx.phase)
			break;
		default:
			if (typeof ctx.type === 'string') generate = periodic[ctx.type]
			else generate = ctx.type
	}

	assert(generate, 'Unrecognized type of function')

	return oscillate


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
			if (params.frequency) ctx.frequency = params.frequency
			if (params.detune) ctx.detune = params.detune
			for (let name in aParams) {
				if (params[name] !== undefined) aParam(name, params[name])
			}
		}

		//evaluate context
		let frequency = ctx.frequency.call ? ctx.frequency(ctx) : ctx.frequency
		let detune = ctx.detune.call ? ctx.detune(ctx) : ctx.detune

		for (let name in aParams) {
			let p = aParams[name]
			ctx[name] = p && p.call ? p(ctx) : p
		}

		let sampleRate = buf.sampleRate
		let period = sampleRate / (frequency * Math.pow(2, detune / 1200))
		let count = ctx.count

		//fill channels
		for (let c = 0, l = buf.length; c < buf.numberOfChannels; c++) {
			let arr = buf.getChannelData(c)
			for (let i = 0; i < l; i++) {
				ctx.count++
				ctx.time = (count + i) / sampleRate
				ctx.t = ((count + i) % period) / period
				arr[i] = generate(ctx)
			}
		}

		//convert to target dtype
		if (format.type === 'audiobuffer') return buf
		if (dst.length) return convert(buf, format, dst)
		return convert(buf, format)
	}
}


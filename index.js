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

	let format = options.format || 'audiobuffer'

	format = typeof format === 'string' ? aformat.parse(format) : aformat.detect(format)
	if (!format.sampleRate) format.sampleRate = 44100


	if (options.type == null) options.type = 'sine'

	//oscillating context
	let ctx = {
		frequency: options.frequency || 440,
		detune: options.detune || 0,
		count: 0,
		time: 0,
		t: 0
	}

	//handle function aliases
	switch (options.type) {
		case 'saw':
		case 'sawtooth':
			ctx.inversed = options.inversed != null ? options.inversed : false
			options.type = (t, ctx) => periodic.sawtooth(t, ctx.inversed)
			break;
		case 'delta':
		case 'pulse':
			options.type = (t, ctx) => periodic.pulse(t)
			break;
		case 'tri':
		case 'triangle':
			ctx.ratio = options.ratio != null ? options.ratio : 0.5
			options.type = (t, ctx) => periodic.triangle(t, ctx.ratio)
			break;
		case 'sqr':
		case 'square':
		case 'rect':
		case 'rectangle':
			ctx.ratio = options.ratio != null ? options.ratio : 0.5
			options.type = (t, ctx) => periodic.rectangle(t, ctx.ratio)
			break;
		case 'series':
		case 'periodic':
		case 'fourier':
			ctx.real = options.real != null ? options.real : [0, 1]
			ctx.imag = options.imag
			ctx.normalize = options.normalize != null ? options.normalize : true
			options.type = (t, ctx) => periodic.series(t, ctx.real, ctx.imag, ctx.normalize)
			break;
		case 'cos':
		case 'cosine':
			ctx.phase = options.phase != null ? options.phase : 0
			options.type = (t, ctx) => periodic.sine(t + ctx.phase + .25)
			break;
		case 'sin':
		case 'sine':
			ctx.phase = options.phase != null ? options.phase : 0
			options.type = (t, ctx) => periodic.sine(t + ctx.phase)
			break;
		default:
			if (typeof options.type === 'string') options.type = periodic[options.type]
	}

	assert(options.type, 'Unrecognized type of function')

	//figure out generating function
	let generate = options.type

	return oscillate


	//fill passed source with oscillated data
	function oscillate (dst, params) {
		let buf = dst

		if (buf == null) buf = 1024

		//make sure we deal with audio buffer
		if (!isAudioBuffer(buf)) {
			buf = createBuffer(buf, format)
		}

		if (params) extend(ctx, params)

		let frequency = getParam('frequency', ctx)
		let detune = getParam('detune', ctx)
		let sampleRate = buf.sampleRate
		let period = sampleRate / (frequency * Math.pow(2, detune / 1200))
		let count = ctx.count

		for (let c = 0, l = buf.length; c < buf.numberOfChannels; c++) {
			let arr = buf.getChannelData(c)
			for (let i = 0; i < l; i++) {
				ctx.time = (count + i) / sampleRate
				ctx.t = ((count + i) % period) / period
				arr[i] = generate(ctx.t, ctx)
			}
		}

		ctx.count += buf.length
		ctx.time = ctx.count / buf.sampleRate


		if (format.type === 'audiobuffer') return buf
		if (dst.length) return convert(buf, format, dst)
		return convert(buf, format)
	}


	//figure out periodic params
	function getParam (param, ctx) {
		var val = ctx[param]

		if (val.call) return val(ctx)

		return val
	}
}


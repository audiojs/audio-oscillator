//audio oscillator demo

'use strict'

const createWriter = require('web-audio-write')
const createOscillator = require('./')
const context = require('audio-context')()
const createBuffer = require('audio-buffer-from')
const createPanel = require('settings-panel')
const createWaveform = require('gl-waveform')

//rendering
let wf = createWaveform({palette: ['white', 'black']})

//settings
let panel = createPanel([
	{id: 'type', type: 'switch', values:[]},
	{id: 'frequency', type: 'range', value: 440, min: 20, max: 16000, log: true},
	{id: 'detune', type: 'range', value: 0, min: -100, max: 100, log: false},
], {style: `background: none`})

//audio nodes
let write = createWriter(context.destination)

let osc = createOscillator({
	type: 'sin',
	frequency: ctx => panel.state.frequency,
	detune: ctx => panel.state.detune
})

//output cycle
let buf = createBuffer(1024, {context: context})
let count = 0;

(function tick(err) {
	if (err) throw err
	count += 1024
	if (count > 44100*5) return write(null)
	let last = buf.getChannelData(0).subarray(-1)[0]
	write(osc(buf), tick)

	wf.push(buf.getChannelData(0))
	// console.log(last - buf.getChannelData(0).subarray(0,1)[0])
})()

//audio oscillator demo

'use strict'

const createWriter = require('web-audio-write')
const createOscillator = require('./')
const context = require('audio-context')()
const createBuffer = require('audio-buffer-from')

let write = createWriter(context.destination)

let osc = createOscillator({
	type: 'pulse'
})

//output thing
let buf = createBuffer(1024, {context: context})
let count = 0;

(function tick(err) {
	if (err) throw err
	count += 1024
	if (count > 44100) return write(null)
	write(osc(buf), tick)
})()

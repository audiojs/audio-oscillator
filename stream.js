/**
 * Oscillator stream
 * http://webaudio.github.io/web-audio-api/#the-oscillatornode-interface
 *
 * @module  audio-oscillator
 */
'use strict';

var direct = require('./direct')
var Readable = require('readable-stream')
var inherits = require('util').inherits
var objectAssign = require('object-assign')

/**
 * @constructor
 */
function Oscillator (options) {
	if (!(this instanceof Oscillator)) return new Oscillator(options);

	Readable.call(this, objectAssign({objectMode: true}, options))

	var oscillate = this.oscillate = direct(options)

	this.setWave = function (type, im, real) {
		oscillate.setWave(type, im, real)
		return this
	}
}

Oscillator.prototype.pipe = function pipe (writable) {
	this.oscillate(function (buf, done) {
		writable.write(buf)
		done(null)
	})
	return writable
}


inherits(Oscillator, Readable);


module.exports = Oscillator;

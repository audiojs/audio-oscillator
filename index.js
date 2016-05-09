/**
 * Oscillator stream
 * http://webaudio.github.io/web-audio-api/#the-oscillatornode-interface
 *
 * @module  audio-oscillator
 */


var inherits = require('inherits');
var Through = require('audio-through');
var extend = require('xtend/mutable');
var util = require('audio-buffer-utils');


/**
 * @constructor
 */
function Oscillator (options) {
	if (!(this instanceof Oscillator)) return new Oscillator(options);

	Through.call(this, options);

	this.real = [0, 1];
	this.im = [0, 0];
}


inherits(Oscillator, Through);



/**
 * Fundamental oscillation frequency
 */
Oscillator.prototype.frequency = 440;


/**
 * Frequency detune
 *
 * @True {number}
 */
Oscillator.prototype.detune = 0;


/**
 * sine, square, sawtooth, triangle, custom
 */
Oscillator.prototype.type = 'sine';


/**
 * Normalization, used for periodic waves
 */
Oscillator.prototype.normalize = true;


/**
 * Collection of oscillator types. 0 < t < 1
 */
Oscillator.prototype.types = {};

Oscillator.prototype.types.sin =
Oscillator.prototype.types.sine =
function (t) {
	return Math.sin(Math.PI * 2 * t);
};

Oscillator.prototype.types.square =
Oscillator.prototype.types.rect =
function (t) {
	if (t >= 0.5) return -1;
	return 1;
};

Oscillator.prototype.types.pulse =
Oscillator.prototype.types.delta =
function (t) {
	if (t < 0.01) return 1;
	return -1;
};

Oscillator.prototype.types.sawtooth =
Oscillator.prototype.types.saw =
function (t) {
	return 1 - 2 * t;
};

Oscillator.prototype.types.triangle =
Oscillator.prototype.types.tri =
function (t) {
	if (t > 0.5) t = 1 - t;
	return 1 - 4 * t;
};

Oscillator.prototype.types.wave =
function (t, real, im, normalize) {
	var res = 0;
	var pi2 = Math.PI * 2;
	var N = real.length;
	var sum = [0,0];

	for (var harmonic = 0; harmonic < N; harmonic++) {
		res += real[harmonic] * Math.cos(pi2 * t * harmonic) + im[harmonic] * Math.sin(pi2 * t * harmonic);
		sum[0] += real[harmonic];
		sum[1] += im[harmonic];
	}

	return normalize ? res / (sum[0] + sum[1]) : res;
};

/**
 * Create periodic wave from arrays or real and imaginary coefficients.
 */
Oscillator.prototype.setPeriodicWave = function (real, im) {
	this.type = 'wave';

	this.real = real;
	this.im = im;

	return this;
};


Oscillator.prototype.process = function (buf) {
	var fn = this.types[this.type];
	var count = this.count;
	var period = this.sampleRate / (this.frequency * Math.pow(2, this.detune / 1200));

	var im = this.im, real = this.real, normalize = this.normalize;
	util.fill(buf, function (x, i) {
		return fn(((count + i) % period) / period, real, im, normalize);
	});

	return buf;
}


module.exports = Oscillator;
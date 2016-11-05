var util = require('audio-buffer-utils');
var pcmDefaults = require('pcm-util').defaults
var AudioBuffer = require('audio-buffer')
var objectAssign = require('object-assign')

module.exports = oscillator

/**
 * Create an oscillator that gives you AudioBuffers
 * in a callback until you stop it.
 *
 * ```js
 * oscillator({ ...options })(speaker())
 * ```
 */
function oscillator (options) {
  options = objectAssign({
    frequency: 440,
    type: 'sine',
    detune: 0,
    normalize: true,
    im: [0, 0],
    real: [0, 1]
  }, pcmDefaults, options)

  // just redefining bunch of options as reference names
  // little bit of math and some state things.
  var fn = oscillator.types[options.type]
  var sampleRate = options.sampleRate
  var period = sampleRate / (options.frequency * Math.pow(2, options.detune / 1200))
  var im = options.im
  var real = options.real
  var normalize = options.normalize
  var size = options.samplesPerFrame
  var channels = options.channels
  var stopped = false
  var count = 0

  /**
   * Reads takes a function and keeps creating audio buffers
   * until you decide to to use the `read.end()` function.
   *
   * ```sh
   * var read = oscillator()
   * read(function (buf, done) {
   *   // use buf then call `done(err?)`
   * })
   * ```
   */
  function read (callback) {
    var buf = new AudioBuffer(channels, size, sampleRate)
    util.fill(buf, function (x, i) {
      return fn(((count + i) % period) / period, real, im, normalize);
    });

    function done () {
      if (!stopped) read(callback)
    }

    callback(buf, done)
    count += size
  }

  /**
   * This lets you change the wave function
   * can be done at the same time it is oscillating.
   *
   * ```js
   * var oscillate = oscillator()
   * oscillate.setWave('periodic', [0, 0], [0, 1])
   * oscillate(function (buf, done) {
  *    speaker(buf, done)
   * })
   * setTimeout(() => oscillate.setWave('sine', 150), 1500)
   * ```
   */
  function setWave (type, newIm, newReal) {
    fn = oscillator.types[type]
    if (type === 'periodic' && newReal) {
      im = newIm
      real = newReal
    } else if (newIm) {
      frequency = newIm
    }
  }

  /**
   * For ending the oscillator.
   */
  function end () {
    stopped = true
  }

  read.setWave = setWave
  read.end = end
  return read
}

/**
 * Oscillator wave functions.
 */
oscillator.types = {
  sine: function sine (t) {
  	return Math.sin(Math.PI * 2 * t);
  },

  square: function square (t) {
  	if (t >= 0.5) return -1;
  	return 1;
  },

  triangle: function triangle (t) {
  	if (t > 0.5) t = 1 - t;
  	return 1 - 4 * t;
  },

  saw: function saw (t) {
	  return 1 - 2 * t;
  },

  pulse: function pulse (t) {
  	if (t < 0.01) return 1;
  	return -1;
  },

  periodic: function periodic (t, real, im, normalize) {
  	var res = 0;
  	var pi2 = Math.PI * 2;
  	var N = real.length;
  	var sum = [0,0];

  	for (var harmonic = 0; harmonic < N; harmonic++) {
  		res += real[harmonic] * Math.cos(pi2 * t * harmonic) +
               im[harmonic] * Math.sin(pi2 * t * harmonic);

  		sum[0] += real[harmonic];
  		sum[1] += im[harmonic];
  	}

  	return normalize ? res / (sum[0] + sum[1]) : res;
  }
}

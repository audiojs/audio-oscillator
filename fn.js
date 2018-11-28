'use strict'

module.exports = oscillate

function oscillate(dst, fn, o, a, b, c) {
	if (!dst) throw Error('First argument should be a number, an array or a list of arrays')
	if (typeof dst === 'number') dst = new Array(dst)

	// list of arrays
	if (dst[0] && dst[0].length != null) return dst.map(function (dst, channel) {
		return oscillate(dst, fn, o, a, b, c)
	})

	if (typeof o === 'number') o = {frequency: o}
	else if (!o) o = {}

	// audiobuffer
	if (dst.getChannelData) {
		if (!o.sampleRate) o.sampelRate = dst.sampleRate
		for (var i = 0; i < dst.numberOfChannels; i++) {
			oscillate(dst.getChannelData(i), fn, o, a, b, c)
		}
		return dst
	}

	o.frequency = o.f != null ? o.f : o.freq != null ? o.freq : o.frequency
	o.phase = o.t != null ? o.t : o.phase

	var t = o.phase != null ? (o.phase || 0) : dst.phase || 0
	var frequency = o.frequency != null ? (o.frequency || 0) : (dst.frequency || 440)
	var detune = o.detune != null ? o.detune : dst.detune || 0
	var rate = o.sampleRate || o.rate || dst.sampleRate || 44100
	var count = dst.count || 0
	var shift = dst.phaseShift != null ? dst.phaseShift : dst.phase != null ? dst.phase : o.phase || 0

	var period = rate / (frequency * Math.pow(2, detune / 1200))
	var count = dst.count || 0

	// correct freq/detune change
	if ((dst.frequency != null && frequency !== dst.frequency) ||
		(dst.detune != null && detune !== dst.detune)) {
		shift = t - (count % period) / period
	}

	// fill data
	for (let i = 0, l = dst.length; i < l; i++) {
		t = (count % period) / period + shift
		dst[i] = fn(t, a, b, c)
		count++
	}

	// save data params to result
	dst.frequency = frequency
	dst.phase = t
	dst.detune = detune
	dst.count = count
	dst.phaseShift = shift
	dst.sampleRate = rate

	return dst
}

'use strict'

var step = require('periodic-function/step')
var osc = require('./fn')


// fill passed source with oscillated data
module.exports = function oscillate (dst, o) {
	var samples = dst.samples || (o && (o.samples || o.values))

	dst = osc(dst, step, o, samples)

	dst.samples = samples

	return dst
}

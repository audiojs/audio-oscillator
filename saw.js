'use strict'

var saw = require('periodic-function/sawtooth')
var osc = require('./fn')


// fill passed source with oscillated data
module.exports = function oscillate (dst, o) {
	var i = dst.inverse || (o && (o.inverse || o.inversed || o.invert || o.inverted)) || false

	dst = osc(dst, saw, o, i)

	dst.inverse = i

	return dst
}

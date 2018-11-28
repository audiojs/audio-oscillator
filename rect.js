'use strict'

var sq = require('periodic-function/square')
var osc = require('./fn')


// fill passed source with oscillated data
module.exports = function oscillate (dst, o) {
	var ratio = (o && o.ratio != null) ? o.ratio :
				(dst && dst.ratio != null) ? dst.ratio : .5

	dst = osc(dst, sq, o, ratio)

	dst.ratio = ratio

	return dst
}

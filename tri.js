'use strict'

var tri = require('periodic-function/triangle')
var osc = require('./fn')


// fill passed source with oscillated data
module.exports = function oscillate (dst, o) {
	var ratio = (o && o.ratio != null) ? o.ratio :
				(dst && dst.ratio != null) ? dst.ratio : .5

	dst = osc(dst, tri, o, ratio)

	dst.ratio = ratio

	return dst
}


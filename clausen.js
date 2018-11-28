'use strict'

var clausen = require('periodic-function/clausen')
var osc = require('./fn')

module.exports = function oscillate (dst, o) {
	var limit = (o && o.limit != null) ? o.limit :
				(dst && dst.limit != null) ? dst.limit : 10

	dst = osc(dst, clausen, o, limit)

	dst.limit = limit

	return dst
}

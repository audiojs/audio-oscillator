'use strict'

var series = require('periodic-function/fourier')
var osc = require('./fn')

module.exports = function oscillate (dst, o) {
	var real = (o && o.real !== undefined) ? o.real :
				(dst && dst.real !== undefined) ? dst.real : [0, 1]
	var imag = (o && o.imag !== undefined) ? o.imag :
				(dst && dst.imag !== undefined) ? dst.imag : null
	var n = dst.normalize != null ? dst.normalize : (o.normalize != null || o.normalized != null) ? !!(o.normalized || o.normalize) : true

	dst = osc(dst, series, o, real, imag, n)

	dst.real = real
	dst.imag = imag
	dst.normalize = n

	return dst
}

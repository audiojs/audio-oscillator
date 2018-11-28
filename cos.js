'use strict'

var sin = require('periodic-function/sine')
var osc = require('./fn')

function cos (t) {
	return sin(t, .5)
}

module.exports = function oscillate (dst, o) {
	return osc(dst, cos, o)
}


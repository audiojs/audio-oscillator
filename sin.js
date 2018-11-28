'use strict'

var sin = require('periodic-function/sine')
var osc = require('./fn')


// fill passed source with oscillated data
module.exports = function oscillate (dst, o) {
	return osc(dst, sin, o)
}


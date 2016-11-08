var direct = require('./direct')

module.exports = oscillator

function oscillator (options) {
  var oscillate = direct(options)
  return function read (end, cb) {
    if (end) return cb(end)
    oscillate(function (buf, done) {
      cb(null, buf)
      done()
    })
  }
}

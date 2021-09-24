const jwt = require('jsonwebtoken')

const auth = {
  generateAccessToken: function (payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '3600s' }) // expires in 1h
  },
  verifyToken: function (cookie) {
    return jwt.verify(cookie, process.env.TOKEN_SECRET)
  }
}

module.exports = auth;

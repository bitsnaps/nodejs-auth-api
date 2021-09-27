const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

const auth = {
  generateAccessToken: function (payload, expirationTime = 60) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expirationTime }) // expires in 60s
  },
  verifyToken: function (cookie) {
    return jwt.verify(cookie, process.env.TOKEN_SECRET)
  },
  passwordEncrypt: async function (password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  },
  passwordCompare: async function (passwordInput, passwordHash) {
    return await bcrypt.compare(passwordInput, passwordHash)
  },
  generateSecretToken: function () {
    return crypto.randomBytes(64).toString('hex')
  }
}

module.exports = auth;

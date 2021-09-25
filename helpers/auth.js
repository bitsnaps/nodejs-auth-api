const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const auth = {
  generateAccessToken: function (payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '3600s' }) // expires in 1h
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

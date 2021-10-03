const router = require('express').Router()
const db = require('../config/db')
const {
  generateAccessToken,
  verifyToken,
  passwordEncrypt,
  passwordCompare
} = require('../helpers/auth')

// Refresh tokens
const refreshTokens = {}

// Register a new user
router.post('/register', async function (req, res) {
  const hashedPassword = await passwordEncrypt(req.body.password)
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  }
  var stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?)')
  stmt.run( user.name, user.email, user.password )
  stmt.finalize( () => {
    db.get('SELECT rowid as id, name, email FROM users WHERE email = ? LIMIT 1', [user.email], function (err, row) {
      if (err){
        res.status(404).json({error: err})
      } else {
        res.status(201).json( row )
      }
    })
  })
})

// Login user via email/password
router.post('/login', (req, res) => {
  const { email, password } = req.body
  const refreshToken = Math.floor(Math.random() * (1000000000000000 - 1 + 1)) + 1

  db.get('SELECT rowid, * FROM users WHERE email = ? LIMIT 1',
    [email], async function (err, user) {
    if (err){
      res.status(404).json({error: err})
    } else if ( typeof(user) == 'undefined') {
      res.status(404).send({error: 'User not found'})
    } else {
      const passwordCheck = await passwordCompare(req.body.password, user.password)
      if (passwordCheck){
        // const secret = generateSecretToken()
        const username = user.name
        // Use this if you want to send back the JWT token
        const accessToken = generateAccessToken(
          {
            username,
            // picture: 'https://github.com/nuxt.png',
            name: 'User ' + username,
            // scope: ['test', 'user']
          }, '2h')

          refreshTokens[refreshToken] = {
            accessToken,
            user: {
              username,
              // picture: 'https://github.com/nuxt.png',
              name: 'User ' + username
            }
          }
          res.json({
            token: {
              accessToken,
              refreshToken
            }
          })
        // res.json({ message: 'success' })
      } else {
        res.status(400).send({ error: 'Invalid credentials'})
      }
    }
  })
})

// Refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body

  if ((refreshToken in refreshTokens)) {
    const user = refreshTokens[refreshToken].user
    const expiresIn = 15
    const newRefreshToken = Math.floor(Math.random() * (1000000000000000 - 1 + 1)) + 1
    delete refreshTokens[refreshToken]
    const accessToken = generateAccessToken(
      {
        user: user.username,
        // picture: 'https://github.com/nuxt.png',
        name: 'User ' + user.username,
        // scope: ['test', 'user']
      })

    refreshTokens[newRefreshToken] = {
      accessToken,
      user
    }

    res.json({
      token: {
        accessToken,
        refreshToken: newRefreshToken
      }
    })
  } else {
    res.sendStatus(401)
  }
})

// [GET] /user: Get loggedin user info by username
router.get('/user', (req, res) => {
  const jwt = req.headers['authorization'].split('Bearer ')[1]
  const claims = verifyToken( jwt )
  if (claims.name === req.user.name){
    res.json({ user: req.user })
  } else {
    res.status(404).send({error: 'User not found'})
  }

})

// [POST] /logout
router.post('/logout', function (req, res) {
  res.send({ status: 'OK' })
})

module.exports = router;

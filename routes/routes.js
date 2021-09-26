const router = require('express').Router()
const db = require('../config/db')
const {
  generateAccessToken,
  verifyToken,
  passwordEncrypt,
  passwordCompare
} = require('../helpers/auth')

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
    db.each('SELECT rowid as id, name, email FROM users ORDER BY rowid DESC LIMIT 1', function (err, row) {
      if (err){
        res.status(404).json({error: err})
      } else {
        res.status(200).json( row )
      }
    })
  })
})

// Login user via email
router.post('/login', function (req, res) {
  db.get('SELECT rowid, * FROM users WHERE email = ? LIMIT 1',
    [req.body.email], async function (err, user) {
    if (err){
      res.status(404).json({error: err})
    } else if ( typeof(user) == 'undefined') {
      res.status(404).send({error: 'User not found'})
    } else {
      const passwordCheck = await passwordCompare(req.body.password, user.password)
      if (passwordCheck){
        // const secret = generateSecretToken()
        // console.log('secret: ', secret);
        const token = generateAccessToken({ id: user.rowid})
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        // Use this if you want to send back the JWT token
        // res.json({ 'token': token,  'id': user.rowid, name: user.name, email: user.email })
        res.json({ message: 'success' })
      } else {
        res.status(400).send({ error: 'Invalid credentials'})
      }
    }
  })
})

// Get loggedin user info
router.get('/user', function (req, res) {
  try {
    const cookie = req.cookies['jwt']
    const claims = verifyToken(cookie)
    if (!claims){
      res.status(401).send('Unauthenticated')
    } else {
      db.get('SELECT rowid, * FROM users WHERE rowid = ?',
      [claims.id], function (err, user) {
        if (err){
          res.status(404).json({error: err})
        } else if (typeof(user) == 'undefined') {
          res.status(404).json({error: 'User not found'})
        } else {
          res.status(200).json({
            id: user.rowid,
            name: user.name,
            email: user.email
          })
        }
      })
    }
  } catch (e) {
    res.status(401).send({ message: 'Unauthenticated' })
  }

})

router.post('/logout', function (req, res) {
  res.cookie('jwt', '', {maxAge: 0})
  res.send({ message: 'success' })
})



/*/ Get user by id
router.get('/user/:id', function (req, res) {
  db.get('SELECT * FROM users WHERE rowid = ?', [req.params.id], function (err, row) {
    if (err){
      res.status(404).json({error: err})
    } else if ( typeof(row) == 'undefined') {
      res.status(404).json({error: 'User not found'})
    } else {
      res.json(row)
    }
  })
})
*/

module.exports = router;

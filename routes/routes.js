const router = require('express').Router()
const db = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Register a new user
router.post('/register', async function (req, res) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  }
  var stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?)')
  stmt.run( user.name, user.email, user.password )
  stmt.finalize( () => {
    db.each('SELECT rowid as _id, name, email FROM users ORDER BY rowid DESC LIMIT 1', function (err, row) {
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
      res.status(404).json({error: 'User not found.'})
    } else {
      const passwordCheck = await bcrypt.compare(req.body.password, user.password)
      if (passwordCheck){
        // const secret = require('crypto').randomBytes(64).toString('hex');
        // console.log(secret);
        const token = generateAccessToken({ _id: user.rowid})
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        // Use this if you want to send back the JWT token
        // res.json({ 'token': token,  '_id': user.rowid, name: user.name, email: user.email })
        res.json({ message: 'success' })
      } else {
        res.status(400).json({ error: 'Invalid credentials'})
      }
    }
  })
})

// Get loggedin user info
router.get('/user', function (req, res) {
  try {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, process.env.TOKEN_SECRET)
    if (!claims){
      res.status(401).json({ messsage: 'Unauthenticated'})
    } else {
      db.get('SELECT rowid, * FROM users WHERE rowid = ?',
      [claims._id], function (err, user) {
        if (err){
          res.status(404).json({error: err})
        } else if (typeof(user) == 'undefined') {
          res.status(404).json({error: 'User not found'})
        } else {
          res.json({
            _id: user.rowid,
            name: user.name,
            email: user.email
          })
        }
      })
    }
  } catch (e) {
    res.status(401).json({ messsage: 'Unauthenticated'})
  }

})

router.post('/logout', function (req, res) {
  res.cookie('jwt', '', {maxAge: 0})
  res.json({ message: 'success'})
})

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '3600s' }); // expires in 1h
}

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

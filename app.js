const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes/routes')
const db = require('./config/db')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')

// Get config vars
dotenv.config()

// Create express app
var app = express()

// Tell express to accept json (fix issue when passing password on post request)
app.use(express.json())

// CORS enabled and allow cookie's credentials
app.use(cors({
  credentials: true,
  // allowed frontend
  origin: [
    'http://localhost:3000',
    'http://localhost:8080'
  ]
}))

// Configure cookieParser
app.use(cookieParser())


// Define a prefix for all routes
app.use('/api', routes)

// Configure bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

db.serialize(function () {
  db.run('CREATE TABLE users (name TEXT, email TEXT, password TEXT)')
  /*/ Insert some users
  var stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?)')
  for (var i = 1; i < 4; i++) {
    stmt.run('user' + i, 'email'+i+'@domain.com', 'password' + i)
  }
  stmt.finalize()
  */
})

/*
var rows = []
db.each('SELECT * FROM users', function (err, row) {
  if (err){
    rows.push({error: err})
    return
  } else {
    rows.push(row)
  }
})
app.get('/users', function (req, res) {
  res.status(200).json(rows)
})
*/

app.get('/', function (req, res) {
  res.status(200).json({message: 'Hello'})
})

process.on('exit', function () {
  db.close()
})

module.exports = app;

const pathModule = require('path')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const db = require('./database')
const auth = require('./auth')
require('./oauth')

const app = express()

const secret = process.env.SESSION_SECRET || 'secretdog'

app.use(require('express-session')({ secret: secret, resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json())

app.post('/api/login', passport.authenticate('local'),
  (req, res) => {
    res.json({ username: req.user.username })
  }
)

app.post('/api/signup', auth.signupHandler)

app.use(express.static(pathModule.join(__dirname, '../dist')))

const PORT = process.env.PORT || 8080
db.syncPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`App is now running on http://localhost:${PORT}`)
  })
})

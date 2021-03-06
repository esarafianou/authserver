const pathModule = require('path')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const db = require('./database')
const auth = require('./auth')
const oauth = require('./oauth')
const history = require('connect-history-api-fallback')

const app = express()

const secret = process.env.SESSION_SECRET || 'secretdog'

app.use(require('express-session')({ secret: secret, resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/api/login', passport.authenticate('local'),
  (req, res) => {
    res.json({ username: req.user.username })
  }
)

app.get('/api/auth/github', passport.authenticate('github'))
app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/?loggedIn=false' }),
  (req, res) => {
    res.redirect('http://localhost:3000')
  })

app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000?loggedIn=false' }),
  (req, res) => {
    res.redirect('http://localhost:3000')
  })

app.post('/api/logout',
  (req, res) => {
    req.logout()
    res.json({})
  }
)

app.post('/api/signup', auth.signupHandler)

app.get('/api/oauth/authorization', oauth.authorizeHandler)
app.post('/api/decision', oauth.grantHandler)
app.post('/api/oauth/token', oauth.tokenHandler)
app.get('/api/userinfo', oauth.userInfoHandler)

app.use(history())
app.use(express.static(pathModule.join(__dirname, '../dist')))

const PORT = process.env.PORT || 8080
db.syncPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`App is now running on http://localhost:${PORT}`)
  })
})

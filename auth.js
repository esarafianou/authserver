const passport = require('passport')
const Strategy = require('passport-local').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const BearerStrategy = require('passport-http-bearer').Strategy
const GitHubStrategy = require('passport-github').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const db = require('./database.js')
const argon2 = require('argon2')

const signup = (username, givenName, familyName, password, confirmPassword, email) => {
  if (password !== confirmPassword) {
    const error = new Error('Passwords should match')
    error.status = 400
    return Promise.reject(error)
  }
  if (password.length < 8) {
    const error = new Error('Password should be at least 8 digits long')
    error.status = 400
    return Promise.reject(error)
  }
  return argon2.hash(password)
  .catch(() => {
    throw new Error('Something went wrong. Please try to register again')
  })
  .then(hashedPassword => {
    return db.User.create({
      username: username,
      family_name: familyName,
      given_name: givenName,
      password: hashedPassword,
      email: email
    })
    .catch(() => {
      const error = new Error('Username already exists')
      error.status = 409
      throw error
    })
  })
}

exports.signupHandler = (req, res) => {
  signup(req.body.username, req.body.givenName, req.body.familyName, req.body.password, req.body.confirmPassword, req.body.email)
  .then(result => {
    res.json({success: true})
  })
  .catch(err => {
    res.status(err.status || 500).send(err.message)
  })
}

const checkPassword = (username, password) => {
  return db.User.find({
    where: {
      username: username
    }
  })
  .then(user => {
    if (user !== null) {
      return argon2.verify(user.password, password)
      .catch(() => {
        throw new Error('Something went wrong. Please try again.')
      })
      .then(match => {
        if (match) {
          return user
        }
      })
    }
    return false
  })
}

passport.use(new Strategy((username, password, done) => {
  checkPassword(username, password)
  .then(user => done(null, user))
  .catch(err => {
    done(new Error('Internal Server Error'))
  })
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  db.User.find({
    where: {
      id: id
    }
  })
  .then(user => done(null, user))
  .catch(err => done(new Error('Internal Server Error')))
})

//This strategy is used to authenticate registered OAuth clients.
//The authentication data are delivered using the basic authentication scheme
passport.use("clientBasic", new BasicStrategy((clientId, clientSecret, done) => {
  db.Client.findOne({where: {client_id: clientId}})
  .then((client) => {
    if (!client) {
      return done(null, false)
    }
    if (client.client_secret === clientSecret) {
      return done(null, client)
    }
    done(null, false)
  })
  .catch((err) => done(new Error('Internal Server Error')))
}))

// This strategy is used to authenticate users based on an access token (bearer token)
passport.use("accessToken", new BearerStrategy((accessToken, done) => {
  db.AccessToken.findOne({where: {token: accessToken}})
  .then((token) => {
    if (!token) {
      return done(null, false)
    }
    if (new Date() > token.expiration_date) {
      return token.destroy()
      .then(() => done(null, false))
    }

    return db.User.findOne({where: {id: token.userId}})
    .then((user) => {
      if (!user) {
        return done(null, false)
      }
      const info = { scope: JSON.parse(token.scope) }
      done(null, user, info);
    })
  })
  .catch(err => done(new Error('Internal Server Error')))
}))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    db.User.findOrCreate({ where: {
      googleId: profile.id,
      username: 'g_' + profile.name.givenName + '_' + profile.name.familyName,
      family_name: profile.name.familyName,
      given_name: profile.name.givenName,
      email: profile.emails[0].value
    }})
    .spread((user, created) => {
      done(null, user)
    })
    .catch((err) => {
      return done(new Error('Internal Server Error'))
    })
  }
))

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    db.User.findOrCreate({ where: {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails[0].value
    }})
    .spread((user, created) => {
      done(null, user)
    })
    .catch((err) => {
      done(new Error('Internal Server Error'))
    })
  }
));

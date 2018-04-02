const passport = require('passport')
const Strategy = require('passport-local').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const BearerStrategy = require('passport-http-bearer').Strategy
const db = require('./database.js')
const argon2 = require('argon2')

const signup = (username, givenName, familyName, password, confirmPassword, email) => {
  if (password !== confirmPassword) {
    throw new Error('Passwords should match')
  } else if (password.length < 8) {
    throw new Error('Password should be at least 8 digits long')
  } else {
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
        throw new Error('Username already exists')
      })
    })
  }
}

exports.signupHandler = (req, res) => {
  signup(req.body.username, req.body.givenName, req.body.familyName, req.body.password, req.body.confirmPassword, req.body.email)
  .then(result => {
    res.json({sucess: true})
  })
  .catch(err => {
    res.status(401).send(err.message)
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
      console.log(err)
      done('Internal Server Error')
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
  .catch(err => done(err))
})

//This strategy is used to authenticate registered OAuth clients.
//The authentication data are delivered using the basic authentication scheme
passport.use("clientBasic", new BasicStrategy(
  function (clientId, clientSecret, done) {
    db.Client.findOne({where: {client_id: clientId}})
    .then((client) => {
      if (!client) return done(null, false)
      if (client.client_secret == clientSecret) return done(null, client)
      else return done(null, false)
    })
    .catch((err) => done(err))
  }
))

// This strategy is used to authenticate users based on an access token (bearer token)
passport.use("accessToken", new BearerStrategy(
  function (accessToken, done) {
    db.AccessToken.findOne({where: {token: accessToken}})
    .then((token) => {
      if (!token) return done(null, false)
      if (new Date() > token.expiration_date) {
        token.destroy()
        .catch((err) => done(err))
      } else {
        db.User.findOne({where: {id: token.userId}})
        .then((user) => {
          if (!user) return done(null, false)
          const info = { scope: JSON.parse(token.scope) }
          done(null, user, info);
        })
        .catch((err) => done(err))
      }
    })
    .catch(err => done(err))
  }
))


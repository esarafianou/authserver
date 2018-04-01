const passport = require('passport')
const Strategy = require('passport-local').Strategy
const db = require('./database.js')
const argon2 = require('argon2')

const signup = (username, password, confirmPassword, email) => {
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
  signup(req.body.username, req.body.password, req.body.confirmPassword, req.body.email)
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


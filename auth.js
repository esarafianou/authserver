const passport = require('passport')
const Strategy = require('passport-local').Strategy
const db = require('./database.js')
const argon2 = require('argon2')

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

const oauth2orize = require('oauth2orize')
const passport = require('passport')
const db = require('./database')
const crypto = require('crypto')

const uid = (length) => {
  return crypto.randomBytes(length).toString('hex')
}

const server = oauth2orize.createServer()

const checkLoggedInUser = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).send()
  } else {
    next()
  }
}

const validateScope = (scope_arr) => {
  scopes = new Set(['openid', 'profile', 'email'])
  valid_scopes = []
  for (i = 0; i < scope_arr.length; i++) {
    if (scopes.has(scope_arr[i])) {
      valid_scopes.push(scope_arr[i])
    }
  }
  return valid_scopes
}

const getUserInfo = (req, res, next) => {
  db.User.findOne({where: {username: req.user.username}})
  .then((user) => {
    res_data = { "sub": "auth0" + user.id }
    if (req.authInfo['scope'].includes('email')) {
      res_data.email = user.email,
      res_data.verified_email = user.verified_email
    }
    if (req.authInfo['scope'].includes('profile')) {
      res_data.name = user.given_name + user.family_name,
      res_data.given_name = user.given_name,
      res_data.family_name = user.family_name,
      res_data.preferred_username = user.username
    }
    res.json(res_data)
  })
}

exports.userInfo = [
  passport.authenticate('accessToken', { session: false }),
  getUserInfo
]

exports.grantHandler = [
  checkLoggedInUser,
  server.decision()
]

exports.token = [
	passport.authenticate('clientBasic', { session: false }),
	server.token(),
	server.errorHandler()
]

// loggedout -> 401
// loggedin
//   authorize success -> 200
//   authorize fail -> 403
exports.authorizeHandler = [
  checkLoggedInUser,
  server.authorize((clientID, redirectURI, done) => {
    db.Client.findOne({ where: {client_id: clientID} })
    .then((client, err) => {
      if (err) { return done(err) }
      if (!client) { return done(null, false) }
      if (client.redirect_uri !== redirectURI) { return done(null, false) }
      return done(null, client, client.redirect_uri)
    })
  }),
  (req, res) => {
    res_data = {
      transactionID: req.oauth2.transactionID,
      user: req.user.username,
      client: req.oauth2.client.name,
      state: req.query.state
    }
      res.json(res_data)
    })
  }
]

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, areq, done) {
  const code = uid(16)
  const valid_scopes = validateScope(areq.scope)

  db.AuthCode.create({
    code: code,
    scope: JSON.stringify(valid_scopes),
    redirect_uri: redirectURI,
    clientId: client.id,
    userId: user.id,
  })
  .then(() => done(null, code))
  .catch((err) => done(err))
}))

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  db.AuthCode.findOne({where: {code: code}})
  .then((code) => {
    if (code === null) { return done(null, false) }
    if (client.id !== code.clientId) { return done(null, false) }

    const acctoken = uid(16)
    const expirationDate = new Date(new Date().getTime() + (3600 * 1000))

    db.AccessToken.create({
      token: acctoken,
      userId: code.userId,
      clientId: code.clientId,
      scope: code.scope,
      expiration_date: expirationDate
    })
    .then((acctoken) => {
      const expirationDate = new Date(new Date().getTime() + 5 * 24 *(3600 * 1000))
      const refreshtoken = uid(16)
      db.RefreshToken.create({
        token: refreshtoken,
        expiration_date: expirationDate,
        userId: code.userId,
        clientId: code.clientId,
      })
      .then((refreshtoken) => {
        code.destroy()
        .then(() =>
          done(null, acctoken.token, refreshtoken.token, { expires_in: acctoken.expiration_date })
        )
        .catch(err => done(err))
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
  })
  .catch(err => done(err))
}))

server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    db.RefreshToken.findOne({where: {token: refreshToken}})
    .then((token) => {
      if (!token) return done(null, false)
      if (client.id !== token.clientId) return done(null, false)
      if (new Date() > token.expiration_date) return done(null, false)
      const newAccessToken = uid(16)
      const expirationDate = new Date(new Date().getTime() + (3600 * 1000))

      db.AccessToken.findOne({where: {userId: token.userId, clientId: token.clientId}})
      .then((acctoken) => {
        acctoken.update({token: newAccessToken, expiration_date: expirationDate})
        .then(() =>  {
          done(null, newAccessToken, refreshToken, {expires_in: expirationDate})
        })
        .catch((err) => done(err))
      })
      .catch((err) => done(err))
    .catch((err) => done(err))
  })
}))

server.serializeClient(function(client, done) {
  return done(null, client.id)
})

server.deserializeClient(function(id, done) {
  db.Client.findOne({where: {id: id}})
  .then((client) => done(null, client))
  .catch((err) => done(err))
})

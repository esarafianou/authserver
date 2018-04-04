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

const hasGrantConsent = (user, client) => {
  return db.UserClientGrant.findOne({where:
    {
      clientId: client.id,
      userId: user.id
    }
  })
  .then((code) => {
    if (code !== null) {
      return true
    }
    return false
  })
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
    const resData = { sub: 'auth0|' + user.id }

    if (req.authInfo.scope.includes('email')) {
      resData.email = user.email
      resData.email_verified = user.verified_email
    }
    if (req.authInfo.scope.includes('profile')) {
      resData.name = user.given_name + ' ' + user.family_name
      resData.given_name = user.given_name
      resData.family_name = user.family_name
      resData.preferred_username = user.username
    }
    res.json(resData)
  })
}

exports.userInfoHandler = [
  passport.authenticate('accessToken', { session: false }),
  getUserInfo
]

exports.grantHandler = [
  checkLoggedInUser,
  server.decision()
]

exports.tokenHandler = [
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
    .then((client) => {
      if (!client || client.redirect_uri !== redirectURI) {
        return done(null, false)
      }

      done(null, client, client.redirect_uri)
    })
    .catch((err) => done(new Error('Internal Server Error')))
  }),
  (req, res) => {
    const resData = {
      transactionID: req.oauth2.transactionID,
      user: req.user.username,
      client: req.oauth2.client.name,
      state: req.query.state
    }
    hasGrantConsent(req.user, req.oauth2.client)
    .then((authorized) => {
      resData.authorized = authorized
      res.json(resData)
    })
    .catch((err) => res.status(500).send('Internal Server Error'))
  }
]

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, areq, done) {
  const code = uid(32)
  const valid_scopes = validateScope(areq.scope)

  db.AuthCode.create({
    code: code,
    scope: JSON.stringify(valid_scopes),
    redirect_uri: redirectURI,
    clientId: client.id,
    userId: user.id,
  })
  .then(() => {
    return db.UserClientGrant.findOrCreate({
      where: {
        userId: user.id,
        clientId: client.id
      }
    })
  .then(() => done(null, code))
  })
  .catch((err) => done('Internal Server Error'))
}))

server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
  db.AuthCode.findOne({where: {code: code}})
  .then((code) => {
    if (code === null || client.id !== code.clientId) {
      return done(null, false)
    }

    const acctoken = uid(32)
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
      const refreshtoken = uid(32)
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
        .catch(err => done(new Error('Internal Server Error')))
      })
      .catch(err => done(new Error('The server could not create a refresh token')))
    })
    .catch(err => done(new Error('The server could not create an access token')))
  })
  .catch(err => done(new Error('Internal Server Error')))
}))

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    db.RefreshToken.findOne({where: {token: refreshToken}})
    .then((token) => {
      if (!token || client.id !== token.clientId || new Date() > token.expiration_date) {
        return done(null, false)
      }

      const newAccessToken = uid(32)
      const expirationDate = new Date(new Date().getTime() + (3600 * 1000))

      return db.AccessToken.findOne({where: {userId: token.userId, clientId: token.clientId}})
      .then((acctoken) => {
        acctoken.update({token: newAccessToken, expiration_date: expirationDate})
        .then(() =>  {
          done(null, newAccessToken, refreshToken, {expires_in: expirationDate})
        })
        .catch((err) => done(new Error('Internal Server Error')))
      })
      .catch((err) => done(new Error('Internal Server Error')))
    .catch((err) => done(new Error('Internal Server Error')))
  })
}))

server.serializeClient((client, done) => done(null, client.id))

server.deserializeClient((id, done) => {
  db.Client.findOne({where: {id: id}})
  .then((client) => done(null, client))
  .catch((err) => done(new Error('Internal Server Error')))
})

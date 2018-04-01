const oauth2orize = require('oauth2orize')
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
    res.json({
      transactionID: req.oauth2.transactionID,
      user: req.user.username,
      client: req.oauth2.client
    })
  }
]


server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, areq, done) {
  const code = uid(16)

  const ac = db.AuthCode.create({
    code: code,
    scope: JSON.stringify(areq.scope),
    redirect_uri: redirectURI,
    clientId: client.id,
    userId: user.id,
  })
  .then(() => done(null, code))
  .catch((err) => done(err))
}))

server.serializeClient(function(client, done) {
  return done(null, client.id)
})

server.deserializeClient(function(id, done) {
  db.Client.findOne({where: {id: id}})
  .then((client) => done(null, client))
  .catch((err) => done(err))
})

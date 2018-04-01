const oauth2orize = require('oauth2orize')
const db = require('./database')
const crypto = require('crypto')

const uid = (length) => {
  return crypto.randomBytes(length).toString('hex')
}

const server = oauth2orize.createServer()

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

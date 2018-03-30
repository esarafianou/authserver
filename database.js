const Sequelize = require('sequelize')

const database = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/postgres'

const Connection = new Sequelize(
  database,
  { operatorsAliases: false }
)

const User = Connection.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const Client = Connection.define('client', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  redirect_uri: {
    type: Sequelize.STRING,
    allowNull: false
  },
  client_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  client_secret: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const AuthCodes = Connection.define('authcode', {
  code: {
    type: Sequelize.STRING,
    allowNull: false
  },
  scope: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const AccessTokens = Connection.define('accesstoken', {
  token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expiration_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  scope: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const RefreshTokens = Connection.define('refreshtoken', {
  refresh_token: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

User.Codes = User.hasMany(AuthCodes)
Client.Codes = Client.hasMany(AuthCodes)

User.AccessTokens = User.hasMany(AccessTokens)
Client.AccessTokens = Client.hasMany(AccessTokens)

User.RefreshTokens = User.hasMany(RefreshTokens)
Client.RefreshTokens = Client.hasMany(RefreshTokens)

const syncPromise = Connection.sync()

module.exports = {
  syncPromise: syncPromise,
  User: User,
  Client: Client,
  AuthCodes: AuthCodes,
  AccessTokens: AccessTokens,
  RefreshTokens: RefreshTokens
}

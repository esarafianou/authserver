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
  given_name: {
    type: Sequelize.STRING,
  },
  family_name: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  verified_email: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  googleId: {
    type: Sequelize.STRING
  },
  githubId: {
    type: Sequelize.STRING
  },
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

const AuthCode = Connection.define('authcode', {
  code: {
    type: Sequelize.STRING,
    allowNull: false
  },
  redirect_uri: {
    type: Sequelize.STRING,
    allowNull: false
  },
  scope: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const AccessToken = Connection.define('accesstoken', {
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

const RefreshToken = Connection.define('refreshtoken', {
  token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expiration_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
})

const UserClientGrant = Connection.define('userclientgrant')

User.Codes = User.hasMany(AuthCode)
Client.Codes = Client.hasMany(AuthCode)

User.AccessTokens = User.hasMany(AccessToken)
Client.AccessTokens = Client.hasMany(AccessToken)

User.RefreshTokens = User.hasMany(RefreshToken)
Client.RefreshTokens = Client.hasMany(RefreshToken)

User.belongsToMany(Client, { through: UserClientGrant })
Client.belongsToMany(User, { through: UserClientGrant })

const syncPromise = Connection.sync()

module.exports = {
  syncPromise: syncPromise,
  User: User,
  Client: Client,
  AuthCode: AuthCode,
  AccessToken: AccessToken,
  RefreshToken: RefreshToken,
  UserClientGrant: UserClientGrant
}

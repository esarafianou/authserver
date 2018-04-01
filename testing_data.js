const { Sequelize } = require('sequelize')
const { Client } = require('./database.js')

const database = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/postgres'

const Connection = new Sequelize(
  database,
  { operatorsAliases: false }
)

Connection.sync().then(() => {
  return Client.create({
    name: 'clientApp',
    client_id: '12345678',
    client_secret: 'za98df76fv45bg90bg12',
    redirect_uri:'https://evasar.io'
  })
  .then(() => {
    console.log('client created')
    Connection.close()
  })
  .catch((error) => {
    Connection.close()
    console.log(error)
  })
})

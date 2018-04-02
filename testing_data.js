const { Sequelize } = require('sequelize')
const { Client, syncPromise } = require('./database.js')

const database = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/postgres'


syncPromise.then(() => {
  return Client.create({
    name: 'clientApp',
    client_id: '12345678',
    client_secret: 'za98df76fv45bg90bg12',
    redirect_uri:'https://auth0.com'
  })
  .then(() => {
    console.log('client created')
  })
  .catch((error) => {
    console.log(error)
  })
})

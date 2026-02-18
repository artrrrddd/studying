const mongoose = require('mongoose')
const app = require('../server/app')

// Кэш подключения к MongoDB для serverless (одно подключение на инстанс)
let cached = global.mongo
if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URL).then((mongoose) => mongoose)
  }
  cached.conn = await cached.promise
  return cached.conn
}

module.exports = async (req, res) => {
  await connect()
  return app(req, res)
}

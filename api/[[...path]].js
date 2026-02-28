const mongoose = require('mongoose')
const app = require('../server/app')

// Кэш подключения к MongoDB для serverless (одно подключение на инстанс)
let cached = global.mongo
if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) return cached.conn
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Add it in Vercel → Project → Settings → Environment Variables.')
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URL).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

module.exports = async (req, res) => {
  try {
    await connect()
    return app(req, res)
  } catch (err) {
    console.error('Serverless function error:', err.message || err)
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : (err.message || String(err))
    })
  }
}

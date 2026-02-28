// Если запускаешь локально — подгружаем .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: require('path').join(__dirname, '..', 'server', '.env'),
  })
}

const mongoose = require('mongoose')
const app = require('../server/app')

/**
 * Кеш подключения для serverless (Vercel)
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  }
}

async function connect() {
  if (!process.env.DB_URL) {
    throw new Error(
      'DB_URL is not set. Add it in Vercel Project Settings → Environment Variables.'
    )
  }

  // Если уже подключены — просто возвращаем соединение
  if (cached.conn) {
    return cached.conn
  }

  // Если подключения ещё нет — создаём promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      bufferCommands: false,
      maxPoolSize: 5,
    }).then((mongooseInstance) => {
      console.log('MongoDB connected')
      return mongooseInstance
    }).catch((err) => {
      cached.promise = null
      throw err
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

module.exports = async (req, res) => {
  try {
    await connect()
    return app(req, res)
  } catch (err) {
    console.error('Database connection error:', err)
    res.statusCode = 500
    res.end('Database connection failed')
  }
}
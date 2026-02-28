const mongoose = require('mongoose')

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      bufferCommands: false,
      maxPoolSize: 5,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

// Вызываем подключение при загрузке app.js (без await, так как express не ждёт)
connectDB().catch(err => {
  console.error('MongoDB connection error:', err)
})

require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const router = require('./router/index')
const errorMiddleware = require('./middleware/error-middleware')

const isProd = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL || (isProd ? true : undefined)
}))
app.use('/api', router)

// Статика только при обычном Node-сервере (Render и т.п.), не на Vercel
if (isProd && !isVercel) {
    const clientDist = path.join(__dirname, '..', 'client', 'dist')
    app.use(express.static(clientDist))
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'))
    })
}

app.use(errorMiddleware)

module.exports = app
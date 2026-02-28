const mongoose = require('mongoose')

// Ленивая загрузка — если require('../server/app') упадёт при загрузке модуля,
// мы поймаем ошибку внутри handler и вернём 500 с текстом
let app
function getApp() {
  if (!app) app = require('../server/app')
  return app
}

let cached = global.mongo
if (!cached) cached = global.mongo = { conn: null, promise: null }

async function connect() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Add it in Vercel → Settings → Environment Variables.')
  }
  // Если соединение есть, но разорвано (cold start / таймаут) — сбрасываем кэш и переподключаемся
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null
    cached.promise = null
  }
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false
    }).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

function sendError(res, err) {
  const msg = err && (err.message || String(err))
  console.error('Serverless function error:', msg)
  try {
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Server error',
        error: process.env.VERCEL ? msg : undefined
      })
    }
  } catch (e) {
    console.error('Failed to send error response:', e)
  }
}

module.exports = async (req, res) => {
  try {
    await connect()
    const app = getApp()
    // Дожидаемся завершения ответа Express, иначе Vercel может завершить функцию до отправки
    await new Promise((resolve, reject) => {
      const onEnd = () => { resolve(); res.off('error', onError) }
      const onError = (e) => { reject(e); res.off('finish', onEnd); res.off('close', onEnd) }
      res.once('finish', onEnd)
      res.once('close', onEnd)
      res.once('error', onError)
      app(req, res)
    })
  } catch (err) {
    sendError(res, err)
  }
}

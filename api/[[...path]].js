// Загружаем .env из server (на Vercel переменные берутся из настроек проекта)
require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') })

const mongoose = require('mongoose')
const app = require('../server/app')

// Кэш подключения к MongoDB для serverless (одно подключение на инстанс)
let cached = global.mongo
if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

const CONNECTED = 1

async function isConnectionAlive() {
  if (mongoose.connection.readyState !== CONNECTED) return false
  try {
    await mongoose.connection.db.admin().ping()
    return true
  } catch {
    return false
  }
}

async function connect() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Add it in Vercel Project Settings → Environment Variables.')
  }
  // Кэш мог сохранить "мёртвое" соединение после заморозки инстанса — проверяем пингом
  if (cached.conn && (await isConnectionAlive())) {
    return cached.conn
  }
  cached.conn = null
  cached.promise = null
  if (mongoose.connection.readyState === CONNECTED) {
    try { await mongoose.disconnect() } catch { /* игнор */ }
  }
  try {
    cached.promise = mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      bufferCommands: false,
      maxPoolSize: 2,
    })
    cached.conn = await cached.promise
    return cached.conn
  } catch (err) {
    cached.promise = null
    throw err
  }
}

// Оборачиваем Express в Promise, чтобы handler не завершался до отправки ответа (важно для Vercel)
function runApp(req, res) {
  return new Promise((resolve, reject) => {
    const onEnd = () => {
      res.off('error', onError)
      resolve()
    }
    const onError = (err) => {
      res.off('finish', onEnd)
      res.off('close', onEnd)
      reject(err)
    }
    res.once('finish', onEnd)
    res.once('close', onEnd)
    res.once('error', onError)
    app(req, res)
  })
}

module.exports = async (req, res) => {
  await connect()
  return runApp(req, res)
}

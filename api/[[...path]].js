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

async function connect() {
  // В serverless кэшированное подключение могло "уснуть" после заморозки инстанса — проверяем
  if (cached.conn && mongoose.connection.readyState === CONNECTED) {
    return cached.conn
  }
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Add it in Vercel Project Settings → Environment Variables.')
  }
  cached.conn = null
  cached.promise = null
  cached.promise = mongoose.connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 10000,
    bufferCommands: false,
  }).then((m) => {
    cached.conn = m
    return m
  }).catch((err) => {
    cached.promise = null
    throw err
  })
  cached.conn = await cached.promise
  return cached.conn
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

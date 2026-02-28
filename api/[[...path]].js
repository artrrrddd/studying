// Загружаем .env из server (на Vercel переменные берутся из настроек проекта)
require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') })

const mongoose = require('mongoose')
const app = require('../server/app')

const CONNECTED = 1

async function connect() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set. Add it in Vercel Project Settings → Environment Variables.')
  }
  if (mongoose.connection.readyState === CONNECTED) {
    return
  }
  await mongoose.connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 15000,
    bufferCommands: false,
    maxPoolSize: 2,
  })
}

function runApp(req, res) {
  return new Promise((resolve, reject) => {
    const done = () => {
      res.off('error', onError)
      mongoose.disconnect().catch(() => {}).finally(() => resolve())
    }
    const onError = (err) => {
      res.off('finish', done)
      res.off('close', done)
      mongoose.disconnect().catch(() => {})
      reject(err)
    }
    res.once('finish', done)
    res.once('close', done)
    res.once('error', onError)
    app(req, res)
  })
}

module.exports = async (req, res) => {
  await connect()
  return runApp(req, res)
}

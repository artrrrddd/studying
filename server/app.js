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
// CORS: в продакшене CLIENT_URL должен быть URL фронта по интернету (например https://ваш-сайт.vercel.app).
// Можно указать несколько через запятую: https://сайт.vercel.app,http://localhost:5174
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = clientUrl
    ? clientUrl.split(',').map(s => s.trim()).filter(Boolean)
    : [];
const corsOrigin = allowedOrigins.length
    ? (origin, cb) => cb(null, allowedOrigins.includes(origin))
    : (isProd ? true : undefined);
app.use(cors({
    credentials: true,
    origin: corsOrigin
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

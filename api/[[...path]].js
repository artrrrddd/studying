// api/index.js

const createApp = require('../server/app')

let cachedApp = null

module.exports = async (req, res) => {
  try {
    if (!cachedApp) {
      cachedApp = await createApp()
    }
    return cachedApp(req, res)
  } catch (err) {
    console.error('🔥 App initialization error:', err)
    res.statusCode = 500
    res.end('Internal server error')
  }
}
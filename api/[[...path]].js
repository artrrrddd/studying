// api/index.js
const serverless = require('serverless-http')
const createApp = require('../server/app')

let cachedApp = null

module.exports = serverless(async () => {
  if (!cachedApp) {
    cachedApp = await createApp()
  }
  return cachedApp
})
const createApp = require('./app')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    const app = await createApp()
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (e) {
    console.error('Server start error:', e)
  }
}

start()
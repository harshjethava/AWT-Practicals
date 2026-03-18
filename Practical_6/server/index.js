import dotenv from 'dotenv'
import { createServer } from './src/server.js'

dotenv.config({ path: new URL('./.env', import.meta.url) })

console.log(`Env loaded: MONGODB_URI=${process.env.MONGODB_URI ? 'set' : 'missing'}`)

const { app, start } = createServer()

const port = process.env.PORT || 5000

start()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })

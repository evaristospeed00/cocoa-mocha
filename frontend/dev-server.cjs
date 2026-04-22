const { startServer } = require('next/dist/server/lib/start-server')

process.env.__NEXT_DEV_SERVER = '1'
process.env.NEXT_PRIVATE_START_TIME = Date.now().toString()

const port = Number.parseInt(process.env.PORT || '3000', 10)
const hostname = process.env.HOSTNAME || '0.0.0.0'

startServer({
  dir: process.cwd(),
  port,
  allowRetry: true,
  isDev: true,
  hostname,
  serverFastRefresh: true,
}).catch((error) => {
  console.error(error)
  process.exit(1)
})

import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const PORT = Number(process.env.PORT || 9000)
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`
const STORE_CORS = process.env.STORE_CORS || 'http://localhost:8000'
const ADMIN_CORS = process.env.ADMIN_CORS || 'http://localhost:9000'
const AUTH_CORS = process.env.AUTH_CORS || `${BACKEND_URL},${STORE_CORS},${ADMIN_CORS}`

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      port: PORT,
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      authMethodsPerActor: {
        user: ['emailpass'],
        customer: ['emailpass'],
      },
      jwtSecret: process.env.MEDUSA_SECRET || process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: [
    {
      resolve: '@medusajs/medusa/auth',
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: '@medusajs/medusa/cart',
    },
    {
      resolve: '@medusajs/medusa/customer',
    },
    {
      resolve: '@medusajs/medusa/order',
    },
    {
      resolve: '@medusajs/medusa/product',
    },
    {
      resolve: '@medusajs/medusa/inventory',
    },
    {
      resolve: '@medusajs/medusa/stock-location',
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          ...(process.env.STRIPE_API_KEY
            ? [
                {
                  resolve: '@medusajs/medusa/payment-stripe',
                  id: 'stripe',
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    ...(process.env.STRIPE_WEBHOOK_SECRET
                      ? { webhookSecret: process.env.STRIPE_WEBHOOK_SECRET }
                      : {}),
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})

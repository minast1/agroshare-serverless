import 'dotenv/config' // Load the .env file into process.env
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().transform((val) => Number(val)).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL string'),
  COGNITO_USER_POOL_ID: z.string().min(8, 'COGNITO_USER_POOL_ID must be at least 8 characters long'),
  COGNITO_CLIENT_ID: z.string().min(8, 'COGNITO_CLIENT_ID must be at least 8 characters long'),
})

//const parseEnv = envSchema.safeParse(process.env)

// if (!parseEnv.success) {
//   console.error('❌ Invalid or missing environment variables configuration:')
//   console.error(JSON.stringify(parseEnv.error.format(), null, 2))
//   process.exit(1) 
// }

export const env = envSchema.parse(process.env)
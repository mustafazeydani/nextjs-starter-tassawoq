import { z } from "zod"

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
})

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format())
  throw new Error("Invalid environment variables")
}

export const env = parsed.data
export type Env = typeof env

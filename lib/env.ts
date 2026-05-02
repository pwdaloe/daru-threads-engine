type RequiredServerEnv = 'JWT_SECRET' | 'OPENAI_API_KEY'

function readRequiredServerEnv(name: RequiredServerEnv): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `${name} belum dikonfigurasi. Tambahkan nilai ini ke .env.local atau environment server Anda.`
    )
  }

  return value
}

export function getJwtSecret(): string {
  return readRequiredServerEnv('JWT_SECRET')
}

export function getOpenAIConfig() {
  return {
    apiKey: readRequiredServerEnv('OPENAI_API_KEY'),
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  }
}

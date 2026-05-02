import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/env'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; email: string }
  } catch {
    return null
  }
}

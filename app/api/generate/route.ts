import { NextRequest, NextResponse } from 'next/server'
import { generatePost } from '@/lib/openai'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key belum dikonfigurasi. Periksa file .env.' },
        { status: 500 }
      )
    }

    const { writingMode, topic, existingContent } = await request.json()

    if (!writingMode) {
      return NextResponse.json(
        { error: 'Mode penulisan diperlukan' },
        { status: 400 }
      )
    }

    const generatedContent = await generatePost({
      writingMode,
      topic,
      existingContent
    })

    return NextResponse.json({ content: generatedContent })

  } catch (error) {
    console.error('Generate post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal menghasilkan konten. Pastikan OpenAI API key sudah dikonfigurasi.' },
      { status: 500 }
    )
  }
}
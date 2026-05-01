import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
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

    const posts = await prisma.post.findMany({
      where: { userId: payload.userId },
      include: {
        analytics: true,
        talentLeads: true,
        _count: {
          select: { talentLeads: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(posts)

  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create new post
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

    const { title, content, writingMode, status } = await request.json()

    if (!content || !writingMode) {
      return NextResponse.json(
        { error: 'Konten dan mode penulisan diperlukan' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        writingMode,
        status: status || 'IDEA',
        userId: payload.userId
      },
      include: {
        analytics: true,
        talentLeads: true
      }
    })

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const parseOptionalDate = (value: string | null | undefined) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

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

export async function PATCH(request: NextRequest) {
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

    const {
      postId,
      title,
      content,
      writingMode,
      status,
      scheduledAt,
      views,
      likes,
      replies,
      reposts
    } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId diperlukan' },
        { status: 400 }
      )
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: payload.userId
      },
      include: {
        analytics: true,
        talentLeads: true,
        _count: {
          select: { talentLeads: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan' }, { status: 404 })
    }

    const postData: Record<string, unknown> = {}
    if (title !== undefined) postData.title = title
    if (content !== undefined) postData.content = content
    if (writingMode !== undefined) postData.writingMode = writingMode
    if (status !== undefined) {
      postData.status = status

      if (status === 'POSTED') {
        postData.postedAt = post.postedAt ?? new Date()
      } else if (status !== 'POSTED') {
        postData.postedAt = null
      }
    }
    if (scheduledAt !== undefined) {
      postData.scheduledAt = scheduledAt ? parseOptionalDate(scheduledAt) : null
    }

    const updatedPost = Object.keys(postData).length > 0
      ? await prisma.post.update({
          where: { id: postId },
          data: postData,
          include: {
            analytics: true,
            talentLeads: true,
            _count: {
              select: { talentLeads: true }
            }
          }
        })
      : post

    let analytics = post.analytics
    if (views !== undefined || likes !== undefined || replies !== undefined || reposts !== undefined) {
      analytics = await prisma.analytics.upsert({
        where: { postId },
        create: {
          postId,
          views: views ?? 0,
          likes: likes ?? 0,
          replies: replies ?? 0,
          reposts: reposts ?? 0
        },
        update: {
          views: views ?? post.analytics?.views ?? 0,
          likes: likes ?? post.analytics?.likes ?? 0,
          replies: replies ?? post.analytics?.replies ?? 0,
          reposts: reposts ?? post.analytics?.reposts ?? 0
        }
      })
    }

    return NextResponse.json({ post: updatedPost, analytics })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui postingan. Silakan coba lagi.' },
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

    const { title, content, writingMode, status, scheduledAt, views, likes, replies, reposts } = await request.json()

    if (!content || !writingMode) {
      return NextResponse.json(
        { error: 'Konten dan mode penulisan diperlukan' },
        { status: 400 }
      )
    }

    const scheduledAtValue = scheduledAt ? parseOptionalDate(scheduledAt) : null
    if (scheduledAt && !scheduledAtValue) {
      return NextResponse.json(
        { error: 'Tanggal jadwal tidak valid' },
        { status: 400 }
      )
    }

    const isPosted = status === 'POSTED'

    const post = await prisma.post.create({
      data: {
        title,
        content,
        writingMode,
        status: status || 'IDEA',
        scheduledAt: scheduledAtValue,
        postedAt: isPosted ? new Date() : null,
        userId: payload.userId,
        analytics: {
          create: {
            views: views ?? 0,
            likes: likes ?? 0,
            replies: replies ?? 0,
            reposts: reposts ?? 0
          }
        }
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

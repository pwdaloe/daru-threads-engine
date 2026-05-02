import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const leadPostSelection = {
  id: true,
  title: true,
  content: true,
  writingMode: true,
  createdAt: true
} as const

// GET /api/leads - Get all talent leads
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

    const leads = await prisma.talentLead.findMany({
      where: {
        post: {
          userId: payload.userId
        }
      },
      include: {
        post: {
          select: leadPostSelection
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat talent leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create new talent lead
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

    const {
      postId,
      leadType,
      name,
      accountName,
      organization,
      email,
      whatsapp,
      location,
      skills,
      notes
    } = await request.json()

    if (postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          userId: payload.userId
        },
        select: { id: true }
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Post tidak ditemukan atau tidak dapat diakses' },
          { status: 404 }
        )
      }
    }

    const lead = await prisma.talentLead.create({
      data: {
        postId,
        leadType: leadType || 'CANDIDATE',
        source: 'MANUAL',
        name,
        accountName,
        organization,
        email,
        whatsapp,
        location,
        skills,
        notes
      },
      include: {
        post: {
          select: leadPostSelection
        }
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat talent lead' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

const leadPostSelection = {
  id: true,
  title: true,
  content: true,
  writingMode: true,
  createdAt: true
} as const

// PUT /api/leads/[id] - Update talent lead
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
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

    const { id } = await params
    const {
      leadType,
      postId,
      name,
      accountName,
      organization,
      email,
      whatsapp,
      location,
      skills,
      notes
    } = await request.json()

    const existingLead = await prisma.talentLead.findFirst({
      where: {
        id,
        post: {
          userId: payload.userId
        }
      },
      select: { id: true }
    })

    if (!existingLead) {
      return NextResponse.json({ error: 'Talent lead tidak ditemukan' }, { status: 404 })
    }

    if (postId) {
      const ownedPost = await prisma.post.findFirst({
        where: {
          id: postId,
          userId: payload.userId
        },
        select: { id: true }
      })

      if (!ownedPost) {
        return NextResponse.json({ error: 'Post tidak ditemukan atau tidak dapat diakses' }, { status: 404 })
      }
    }

    const lead = await prisma.talentLead.update({
      where: { id },
      data: {
        leadType,
        postId: postId || null,
        name,
        accountName,
        organization,
        email,
        whatsapp,
        location,
        skills,
        notes,
        updatedAt: new Date()
      },
      include: {
        post: {
          select: leadPostSelection
        }
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Update lead error:', error)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Talent lead tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Gagal mengupdate talent lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Delete talent lead
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
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

    const { id } = await params
    const existingLead = await prisma.talentLead.findFirst({
      where: {
        id,
        post: {
          userId: payload.userId
        }
      },
      select: { id: true }
    })

    if (!existingLead) {
      return NextResponse.json({ error: 'Talent lead tidak ditemukan' }, { status: 404 })
    }

    await prisma.talentLead.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Talent lead berhasil dihapus' })
  } catch (error) {
    console.error('Delete lead error:', error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Talent lead tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Gagal menghapus talent lead' },
      { status: 500 }
    )
  }
}

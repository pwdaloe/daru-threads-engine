import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            writingMode: true,
            createdAt: true
          }
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

    const { postId, name, accountName, email, whatsapp, location, skills, notes } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID diperlukan' },
        { status: 400 }
      )
    }

    const lead = await prisma.talentLead.create({
      data: {
        postId,
        name,
        accountName,
        email,
        whatsapp,
        location,
        skills,
        notes
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            writingMode: true,
            createdAt: true
          }
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
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const allowedLeadTypes = new Set(['CANDIDATE', 'PARTNER', 'CLIENT'])

export async function POST(request: NextRequest) {
  try {
    const {
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

    if (!leadType || !allowedLeadTypes.has(leadType)) {
      return NextResponse.json(
        { error: 'Tipe lead tidak valid.' },
        { status: 400 }
      )
    }

    if (!name || (!email && !whatsapp)) {
      return NextResponse.json(
        { error: 'Nama dan minimal satu kontak (email atau WhatsApp) wajib diisi.' },
        { status: 400 }
      )
    }

    const lead = await prisma.talentLead.create({
      data: {
        leadType,
        source: 'PUBLIC_FORM',
        name,
        accountName,
        organization,
        email,
        whatsapp,
        location,
        skills,
        notes
      }
    })

    return NextResponse.json({ id: lead.id, message: 'Lead berhasil dikirim.' }, { status: 201 })
  } catch (error) {
    console.error('Create public lead error:', error)
    return NextResponse.json(
      { error: 'Gagal mengirim data. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}

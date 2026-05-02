import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await hashPassword('admin123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@daru-threads.com' },
    update: {},
    create: {
      email: 'admin@daru-threads.com',
      password: hashedPassword,
      name: 'Daru Admin',
      role: 'ADMIN'
    }
  })

  console.log('Created admin user:', admin.email)

  // Create sample posts
  const samplePosts = [
    {
      title: 'Refleksi tentang AI di Indonesia',
      content: `Baru aja baca laporan tentang adoption AI di Indonesia. Menarik banget lihatnya.

Kita lagi di fase dimana AI bukan lagi buzzword, tapi sudah mulai jadi tools sehari-hari. Dari chatbot di customer service sampai recommendation system di e-commerce.

Yang membuat saya excited: peluang untuk talenta-talenta muda Indonesia berkontribusi di level global. Kita punya kombinasi unik - technical skills yang solid plus understanding mendalam tentang market lokal.

Tapi challenge-nya: talent gap. Kita butuh lebih banyak engineer yang paham bukan cuma coding, tapi juga business impact dari AI.

Kalau kamu tertarik explore karir di AI, DM aja ya. Kita bisa diskusi tentang opportunity di Sunartha atau industri AI secara umum.

#AI #Indonesia #Technology #Career`,
      writingMode: 'PERSONAL_BRANDING' as const,
      status: 'POSTED' as const
    },
    {
      title: 'Mencari AI Engineer untuk tim baru',
      content: `Tim AI di Sunartha lagi expand, dan kita cari engineer yang passionate tentang impact teknologi ke bisnis.

Bukan cuma coding, tapi juga:
- Understand business problems
- Build scalable AI solutions
- Collaborate dengan tim cross-functional

Tech stack yang kita gunakan: Python, TensorFlow/PyTorch, AWS/GCP, dan berbagai ML tools.

Yang kita tawarkan:
- Work on real business problems
- Flexible working arrangement
- Competitive compensation
- Opportunity untuk grow dan learn

Kalau kamu excited dengan AI dan mau contribute ke transformation digital perusahaan Indonesia, let's talk!

DM untuk info lebih detail ya.

#Hiring #AI #Engineering #Career`,
      writingMode: 'HIRING' as const,
      status: 'APPROVED' as const
    },
    {
      title: 'ERP Implementation: Lessons Learned',
      content: `Share sedikit pengalaman implementasi ERP di beberapa perusahaan.

Key lessons:
1. Change management lebih penting dari technology choice
2. User adoption determine success, bukan feature completeness
3. Start small, think big - pilot project dulu baru scale

Banyak perusahaan terobsesi dengan "best in class" features, tapi lupa bahwa ERP itu tentang process optimization, bukan feature collection.

Yang sering missed: integration dengan existing systems. Jangan underestimate complexity-nya.

Kalau lagi planning ERP implementation, fokus dulu ke business process mapping. Technology akan follow.

#ERP #Business #Technology #DigitalTransformation`,
      writingMode: 'BUSINESS_INSIGHT' as const,
      status: 'DRAFT' as const
    }
  ]

  for (const postData of samplePosts) {
    const post = await prisma.post.create({
      data: {
        ...postData,
        userId: admin.id
      }
    })

    // Add some analytics for posted content
    if (post.status === 'POSTED') {
      await prisma.analytics.create({
        data: {
          postId: post.id,
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 100) + 10,
          replies: Math.floor(Math.random() * 20) + 1,
          reposts: Math.floor(Math.random() * 10) + 1
        }
      })
    }

    console.log('Created post:', post.title)
  }

  // Create sample talent leads
  const sampleLeads = [
    {
      name: 'Ahmad Rahman',
      accountName: 'ahmadrahman',
      email: 'ahmad.rahman@email.com',
      whatsapp: '+6281234567890',
      location: 'Jakarta',
      skills: 'Python, Machine Learning, TensorFlow',
      notes: 'Fresh graduate computer science, interested in AI/ML. Replied to hiring post about AI Engineer position.'
    },
    {
      name: 'Sari Wijaya',
      accountName: 'sariwijaya',
      email: 'sari.wijaya@email.com',
      whatsapp: '+628987654321',
      location: 'Bandung',
      skills: 'React, Node.js, PostgreSQL',
      notes: 'Senior developer with 5 years experience. Engaged with ERP implementation post, asked about consulting opportunities.'
    },
    {
      name: 'Budi Santoso',
      accountName: 'budisantoso',
      email: 'budi.santoso@email.com',
      whatsapp: '+628112233445',
      location: 'Surabaya',
      skills: 'Business Analysis, AI Strategy, Data Analytics',
      notes: 'Business analyst interested in AI applications. DM after reading AI adoption post.'
    }
  ]

  // Get the first post to attach leads to
  const firstPost = await prisma.post.findFirst({
    where: { status: 'POSTED' }
  })

  if (firstPost) {
    for (const leadData of sampleLeads) {
      await prisma.talentLead.create({
        data: {
          ...leadData,
          postId: firstPost.id
        }
      })
    }
    console.log('Created sample talent leads')
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import OpenAI from 'openai'

const openaiApiKey = process.env.OPENAI_API_KEY
const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY belum dikonfigurasi. Tambahkan OpenAI API key di .env.')
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
})

export interface GeneratePostOptions {
  writingMode: 'PERSONAL_BRANDING' | 'AI_TALENT_FUNNEL' | 'HIRING' | 'BUSINESS_INSIGHT' | 'REWRITE'
  topic?: string
  existingContent?: string
}

const PROMPTS = {
  PERSONAL_BRANDING: `Kamu adalah Daru, Managing Director di Sunartha. Buat postingan Threads yang mencerminkan personal branding dengan gaya bahasa Indonesia yang santai, reflektif, kalimat pendek, humor ringan, wawasan bisnis dan AI, dan soft CTA untuk DM.

Topik: {topic}

Buat postingan yang engaging dan autentik.`,

  AI_TALENT_FUNNEL: `Kamu adalah Daru, Managing Director di Sunartha. Buat postingan Threads untuk menarik talenta AI dengan gaya bahasa Indonesia yang santai, reflektif, kalimat pendek, humor ringan, wawasan bisnis dan AI, dan soft CTA untuk DM.

Topik: {topic}

Fokus pada peluang karir di bidang AI dan teknologi.`,

  HIRING: `Kamu adalah Daru, Managing Director di Sunartha. Buat postingan Threads untuk rekrutmen dengan gaya bahasa Indonesia yang santai, reflektif, kalimat pendek, humor ringan, wawasan bisnis dan AI, dan soft CTA untuk DM.

Posisi: {topic}

Jelaskan peluang dan keuntungan bergabung dengan tim.`,

  BUSINESS_INSIGHT: `Kamu adalah Daru, Managing Director di Sunartha. Buat postingan Threads dengan insight bisnis dan AI dengan gaya bahasa Indonesia yang santai, reflektif, kalimat pendek, humor ringan, wawasan bisnis dan AI, dan soft CTA untuk DM.

Topik: {topic}

Bagikan insight yang berharga dan actionable.`,

  REWRITE: `Kamu adalah Daru, Managing Director di Sunartha. Rewrite konten berikut dengan gaya bahasa Indonesia yang santai, reflektif, kalimat pendek, humor ringan, wawasan bisnis dan AI, dan soft CTA untuk DM.

Konten asli:
{existingContent}

Buat versi yang lebih engaging dan autentik.`,
}

export interface GeneratePostResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function generatePost(options: GeneratePostOptions): Promise<GeneratePostResult> {
  const prompt = PROMPTS[options.writingMode]
    .replace('{topic}', options.topic || 'topik umum')
    .replace('{existingContent}', options.existingContent || '')

  try {
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah Daru, Managing Director di Sunartha. Komunikasi dalam bahasa Indonesia dengan gaya yang santai, reflektif, dan engaging.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return {
      content: completion.choices[0]?.message?.content?.trim() || 'Gagal menghasilkan konten.',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }
    }
  } catch (error) {
    console.error('OpenAI generation error:', error)
    throw new Error(
      'Gagal menghasilkan konten menggunakan OpenAI. ' +
      (error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.')
    )
  }
}
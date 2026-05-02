# Daru Threads Engine

Personal branding and AI talent funnel content system for Daru, Managing Director of Sunartha.

## 🚨 SECURITY WARNING

**This repository is PUBLIC on GitHub. Never commit real credentials or sensitive information.**

### What NOT to do:
- ❌ Never commit `.env` files with real credentials
- ❌ Never expose API keys, database passwords, or JWT secrets
- ❌ Never share sensitive configuration in code

### Security Best Practices:
- ✅ Use `.env.example` as template for environment variables
- ✅ Store real credentials in `.env.local` (automatically ignored by git)
- ✅ Rotate credentials immediately if accidentally exposed
- ✅ Use environment-specific credentials (dev/staging/prod)
- ✅ Monitor API usage for unauthorized access

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API
- **Authentication**: JWT with bcrypt

## Features

- ✅ Admin login system
- ✅ Dashboard with content analytics
- ✅ AI-powered content generator with Daru's writing style
- ✅ Content management with status workflow (idea → draft → approved → scheduled → posted)
- ✅ Manual analytics input (views, likes, replies, reposts)
- ✅ Talent lead tracking from engagements
- ✅ Content calendar page for scheduled posts
- ✅ Multiple writing modes (personal branding, AI talent funnel, hiring, business insights, rewrite)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd daru-threads-app
npm install
```

### 2. Environment Setup

**CRITICAL: Never commit real credentials to version control!**

Copy the environment template and configure your variables:

```bash
# Copy template (safe to commit)
cp .env.example .env.local
```

Edit `.env.local` with your actual values (this file is automatically ignored by git):

```env
# Database - Get from Supabase Dashboard
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optional: direct connection for Prisma CLI
# DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# OpenAI API - Get from OpenAI Platform
OPENAI_API_KEY="sk-proj-your-actual-openai-api-key"

# JWT Secret - Generate secure random string
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Generate Secure JWT Secret

```bash
# Generate a secure random string for JWT
openssl rand -hex 32
```

Or use online generators, but never reuse secrets across environments.

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/auth/login`.

### 5. Default Login

- **Email**: admin@daru-threads.com
- **Password**: admin123

⚠️ **Change default password immediately after first login!**

## Security Checklist

### Before Going Live:
- [ ] Rotate all API keys and database credentials
- [ ] Use environment-specific credentials (dev/staging/prod)
- [ ] Enable database connection pooling limits
- [ ] Set up API rate limiting
- [ ] Configure CORS properly
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring and alerts for suspicious activity

### Ongoing Security:
- [ ] Monitor OpenAI API usage for unauthorized access
- [ ] Regularly rotate JWT secrets
- [ ] Keep dependencies updated
- [ ] Review access logs periodically
- [ ] Use strong, unique passwords

## Project Structure

```
daru-threads-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── posts/                # Content management
│   │   └── generate/             # AI content generation
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   │   ├── calendar/             # Content calendar page
│   │   ├── generate/             # AI generator page
│   │   ├── leads/                # Talent leads page
│   │   ├── posts/                # Posts management page
│   │   ├── layout.tsx            # Dashboard layout
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication helpers
│   ├── openai.ts                 # OpenAI integration
│   └── prisma.ts                 # Database client
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Sample data
├── public/                       # Static assets
└── .env.local                    # Local environment variables (ignored by git)
```

## Database Schema

### User
- Admin authentication with JWT

### Post
- Content with status workflow
- Writing modes for different content types
- Scheduling capabilities

### Analytics
- Manual input for engagement metrics
- Views, likes, replies, reposts tracking

### TalentLead
- Capture leads from content engagements
- Contact information and notes

## Writing Modes

1. **Personal Branding**: Authentic content showcasing Daru's perspective
2. **AI Talent Funnel**: Content to attract AI/ML talent
3. **Hiring**: Recruitment posts for specific positions
4. **Business Insight**: Valuable insights on business and AI
5. **Rewrite**: Transform existing content into Daru's voice

## AI Content Generation

The system uses OpenAI to generate content in Daru's authentic voice.

- **Language**: Indonesian
- **Style**: Casual, reflective, short sentences
- **Tone**: Light humor, business insights, soft CTAs
- **Personality**: Approachable, knowledgeable, engaging
- **Model**: default `gpt-3.5-turbo`, overridable via `OPENAI_MODEL`

## Known AI limitations

- AI generation depends on your OpenAI account access and quota.
- If you see `404 model does not exist`, use `OPENAI_MODEL=gpt-3.5-turbo` or another model available in your account.
- If you see `429 quota exceeded`, update your OpenAI plan or billing limit before retrying.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Content Management
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post

### AI Generation
- `POST /api/generate` - Generate content with AI

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed sample data
```

## Deployment

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- `DATABASE_URL` - Production PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Strong random string for JWT signing

### Build and Deploy

```bash
npm run build
npm run start
```

The app will be available on port 3000 by default.

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all linting passes

## License

This project is proprietary software for Sunartha.

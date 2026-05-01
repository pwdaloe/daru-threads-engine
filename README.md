# Daru Threads Engine

Personal branding and AI talent funnel content system for Daru, Managing Director of Sunartha.

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
- ✅ Content calendar view
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

Copy the `.env` file and configure your environment variables:

```bash
cp .env .env.local
```

Edit `.env.local` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/daru_threads_db?schema=public"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key-here"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-here"
```

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
│   │   ├── generate/             # AI generator page
│   │   └── layout.tsx            # Dashboard layout
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
└── .env                          # Environment variables
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

The system uses OpenAI's GPT-4 to generate content in Daru's authentic voice:

- **Language**: Indonesian
- **Style**: Casual, reflective, short sentences
- **Tone**: Light humor, business insights, soft CTAs
- **Personality**: Approachable, knowledgeable, engaging

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

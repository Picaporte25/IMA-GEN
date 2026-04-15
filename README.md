# IMA-GEN - AI Image Generator

A modern, futuristic AI image generator built with Next.js, featuring a stunning dark theme with orange/violet accents and glassmorphism effects.

## Features

- **AI Image Generation**: Create stunning images using artificial intelligence
- **Futuristic Design**: Dark theme with neon effects and glassmorphism
- **Credit System**: Pay-per-use model, no subscriptions
- **Multiple Styles**: Choose from various art styles
- **Flexible Resolutions**: Generate images from 512×512 to 4K
- **Gallery System**: Save and manage your generated images
- **Secure Authentication**: JWT-based authentication system
- **Payment Integration**: Paddle payment processing

## Tech Stack

- **Frontend**: Next.js 16, React 18, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase
- **Authentication**: JWT with bcrypt
- **Payment**: Paddle
- **AI API**: FAL.ai

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- FAL.ai API key (or use the provided API key for testing)
- Paddle account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ima-gen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key

   # FAL.ai API Configuration
   FAL_API_KEY=your_fal_ai_api_key

   # Paddle Configuration
   NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN=your_paddle_client_token
   PADDLE_API_KEY=your_paddle_api_key
   PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Setup Supabase database**

   - Create a new project in Supabase
   - Go to the SQL Editor
   - Execute the SQL from `supabase-setup.sql`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following tables:

- **users**: User accounts with email, password, and credits
- **images**: Generated images with prompts, settings, and URLs
- **credit_transactions**: Transaction history for credit purchases and usage

## Credit System

- New users get 10 free credits upon signup
- Credits are consumed based on image resolution:
  - 512×512: 1 credit per image
  - 768×768: 1 credit per image
  - 1024×1024: 1 credit per image (standard)
  - 1536×1536: 2 credits per image
- Credits never expire
- Commercial use is permitted for all generated images

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify authentication

### Images
- `POST /api/images/generate` - Generate new images
- `DELETE /api/images/delete` - Delete image
- `GET /api/user/images` - Get user's images

### Credits
- `GET /api/credits/balance` - Get credit balance

### Payments
- `POST /api/payment/paddle-create-checkout` - Create Paddle checkout
- `POST /api/payment/paddle-webhook` - Handle Paddle webhooks

## Configuration

### Tailwind CSS Theme

The application uses a custom Tailwind theme with:
- Background colors: `#0a0a0a` (primary), `#141414` (secondary), `#1a1a1a` (card)
- Accent colors: Orange (`#FF6B00`, `#FF8C00`), Violet (`#8B5CF6`, `#A78BFA`), White (`#FFFFFF`)
- Custom animations: gradients, glow effects, particles

### Paddle Setup

1. Create a Paddle account
2. Create products/prices for credit packages
3. Configure webhook endpoint: `https://your-domain.com/api/payment/paddle-webhook`
4. Add credentials to environment variables

## Deployment

### Vercel

The project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NANO_BANANA_API_KEY`
- `NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN`
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `JWT_SECRET` (Use a strong, random string)
- `NEXT_PUBLIC_APP_URL` (Your production URL)

## Security Considerations

- Never commit `.env.local` files
- Use strong JWT secrets in production
- Enable RLS (Row Level Security) in Supabase
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs

## Troubleshooting

### Images not generating
- Check Nano Banana API key is correct
- Verify user has sufficient credits
- Check browser console for errors

### Payment issues
- Verify Paddle API credentials
- Check webhook URL is accessible
- Ensure Paddle webhook secret matches

### Database connection issues
- Verify Supabase credentials
- Check Supabase project is active
- Ensure SQL setup was executed correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact support@ima-gen.com.

## Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Powered by Nano Banana AI
- Payments processed by Paddle
- Database by Supabase

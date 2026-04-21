# VirtuStage - Real Estate Virtual Staging

A modern, futuristic AI-powered virtual staging platform built with Next.js, featuring a stunning dark theme with orange/violet accents and glassmorphism effects.

## Features

- **AI Virtual Staging**: Transform empty properties with professional furniture placement
- **Property Editing**: Edit existing property photos with AI while preserving 100% original structure
- **Predefined Real Estate Styles**: 10 professional styles (Modern, Scandinavian, Asian Zen, Industrial, Luxury, etc.)
- **Before/After Inspiration Gallery**: Visual examples to inspire users and demonstrate capabilities
- **Custom Prompt Writing**: Manual prompt input with style suggestions and modifications
- **Reference Image Support**: Upload reference images to guide transformations with visual examples
- **Futuristic Design**: Dark theme with neon effects and glassmorphism
- **Credit System**: Pay-per-use model, no subscriptions
- **Multiple Design Styles**: Modern, Classic, Scandinavian, Industrial, Luxury
- **Flexible Resolutions**: Stage properties from 512×512 to 4K quality
- **Gallery System**: Save and manage your staged rooms
- **Secure Authentication**: JWT-based authentication system
- **Payment Integration**: Paddle payment processing

## Tech Stack

- **Frontend**: Next.js 16, React 18, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase
- **Authentication**: JWT with bcrypt
- **Payment**: Paddle
- **AI API**: Qwen Image Edit (Alibaba Cloud DashScope) + FAL.ai (Z-Image Turbo for room generation)

## Qwen Image Edit - Property Transformation

The platform uses Qwen Image Edit for advanced property transformations:

- **Preserve 100% Structure**: Original architectural details, perspective, and composition are maintained
- **Targeted Editing**: Edit specific elements like walls, flooring, furniture, or lighting
- **AI-Powered Transformation**: Advanced AI understanding of real estate photography
- **Fast & Cost-Effective**: Single AI model processing, good for standard edits
- **Real Estate Presets**: Pre-configured transformation options optimized for property photography:
  - **Wall Material**: Change wall materials (brick, plaster, stone, etc.)
  - **Flooring**: Replace flooring material (tile, wood, marble, etc.)
  - **Furniture**: Update furniture style and pieces
  - **Lighting**: Adjust lighting and atmosphere
  - **Complete Style**: Complete room style transformation
  - **Color Scheme**: Change overall color palette
- **Credit-Based Pricing**: Edit costs based on resolution and transformation complexity
- **Before/After Comparison**: Interactive slider to compare original and transformed images
- **Reference Image Support**: Upload or paste reference images to guide the AI transformation with visual examples

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

   # FAL.ai API Configuration (for room generation)
   FAL_API_KEY=your_fal_ai_api_key

   # Qwen Image Edit API Configuration (for property transformation)
   QWEN_API_KEY=your_qwen_api_key

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

   **🏠 Main page (`/`) includes:**
   - Room generation with 10 predefined Real Estate styles
   - Before/After inspiration gallery (including your Scandinavian living room example)
   - Custom prompt writing with style suggestions
   - Direct access to all generation features

## Database Schema

The application uses the following tables:

- **users**: User accounts with email, password, and credits
- **images**: Staged rooms with prompts, settings, and URLs
- **credit_transactions**: Transaction history for credit purchases and usage

## Credit System

- New users get 10 free credits upon signup
- Credits are consumed based on operation:

### Room Generation (Z-Image Turbo):
  - 512×512: 1 credit per room (~$0.001)
  - 768×768: 1 credit per room (~$0.002)
  - 1024×1024: 2 credits per room (~$0.005)
  - 1536×1536: 4 credits per room (~$0.011)
  - 2048×2048: 8 credits per room (~$0.020)

### Property Editing (Qwen Image Edit):
  - 512×512: 5-10 credits per edit (~$0.005-0.01)
  - 768×768: 10-15 credits per edit (~$0.01-0.015)
  - 1024×1024: 20-25 credits per edit (~$0.02-0.025)
  - 1536×1536: 30-40 credits per edit (~$0.03-0.04)
  - 2048×2048: 40-50 credits per edit (~$0.04-0.05)

- Credits never expire
- Commercial use is permitted for all staged rooms and edited properties
- Qwen Image Edit preserves 100% of original structure while making targeted changes

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify authentication

### Rooms
- `POST /api/images/generate` - Stage new rooms
- `DELETE /api/images/delete` - Delete staged room
- `GET /api/user/images` - Get user's staged rooms
- **Enhanced Generation Interface**: `src/components/EnhancedImageGenerator.jsx` with predefined styles and inspiration gallery
- **Real Estate Styles**: 10 predefined styles in `src/lib/nanoBanana.js` (REAL_ESTATE_STYLES)
- **Before/After Examples**: Inspiration gallery in `src/lib/nanoBanana.js` (BEFORE_AFTER_EXAMPLES)
  - **✅ Active User Example**: Living room to Scandinavian style transformation with salamander preservation
  - Before: `Before.webp`, After: `After.png` in `public/examples/before-after/`
  - Prompt: "Transform this environment into a living room (maintaining the salamander, and ensure the overall style is Scandinavian style, add warm lighting because the environment is very dark in its interior)"
  - **User Examples**: Place personal before/after examples in `public/examples/before-after/` (instructions in `INSTRUCCIONES.md`)
  - **Gallery Access**: Users can browse examples in `/generate` → "Show Examples" for inspiration

### Property Editing
- Frontend: `/edit` - Property transformation interface with Qwen Image Edit
- `src/lib/nanoBanana.js`: `editPropertyQwen()` - Qwen Image Edit function
- `src/components/QwenPropertyEditor.jsx`: UI component for property transformation
- Real estate presets: Wall materials, flooring, furniture, lighting, complete styles, color schemes

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
- `FAL_API_KEY`
- `QWEN_API_KEY`
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

### Rooms not staging
- Check FAL.ai API key is correct
- Verify user has sufficient credits
- Check browser console for errors

### Property editing issues
- Check Qwen Image Edit API key is correct
- Verify user has sufficient credits for property transformation
- Ensure uploaded image is valid (JPG, PNG, WebP, GIF, AVIF)
- Try different transformation presets for different use cases
- Check browser console for specific Qwen Image Edit error messages

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
- Room generation powered by Z-Image Turbo (FAL.ai)
- Property transformation powered by Qwen Image Edit (Alibaba Cloud DashScope)
- Payments processed by Paddle
- Database by Supabase

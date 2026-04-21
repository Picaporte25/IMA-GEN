import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { ParticlesBackground } from './ParticlesBackground';

export default function Layout({ children, title, user, credits, description, keywords, ogImage }) {
  return (
    <>
      <Head>
        <title>{title || 'IMA-GEN - AI Image Generator | Create Stunning AI Images'}</title>
        <meta
          name="description"
          content={description || 'Create stunning AI-generated images with IMA-GEN. Professional quality images in seconds using artificial intelligence. Transform your imagination into reality with our cutting-edge AI image generator.'}
        />
        <meta
          name="keywords"
          content={keywords || 'AI image generator, artificial intelligence images, AI art, text to image, image generation, AI graphics, machine learning images, creative AI, digital art AI, automated image creation'}
        />
        <meta name="author" content="IMA-GEN" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ima-gen.com/" />
        <meta property="og:title" content={title || 'IMA-GEN - AI Image Generator'} />
        <meta
          property="og:description"
          content={description || 'Create stunning AI-generated images with IMA-GEN. Professional quality images in seconds using artificial intelligence.'}
        />
        <meta property="og:image" content={ogImage || '/images/ima-gen-og.jpg'} />
        <meta property="og:site_name" content="IMA-GEN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ima-gen.com/" />
        <meta name="twitter:title" content={title || 'IMA-GEN - AI Image Generator'} />
        <meta
          name="twitter:description"
          content={description || 'Create stunning AI-generated images with IMA-GEN. Professional quality images in seconds using artificial intelligence.'}
        />
        <meta name="twitter:image" content={ogImage || '/images/ima-gen-og.jpg'} />

        {/* Canonical URL */}
        <link rel="canonical" href="https://ima-gen.com/" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* Additional SEO */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IMA-GEN" />

        {/* Schema Markup - Optimized for Real Estate */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "IMA-GEN",
              "alternateName": "IMA-GEN Real Estate AI",
              "description": "AI-powered image generator for real estate. Create professional property images, virtual staging, and interior designs in seconds.",
              "url": "https://ima-gen.com",
              "applicationCategory": "RealEstateApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0.10",
                "priceCurrency": "USD",
                "description": "AI image generation credits for real estate starting at $0.10 per image",
                "availability": "https://schema.org/InStock"
              },
              "featureList": [
                "AI-powered real estate image generation",
                "Professional virtual staging",
                "Intelligent interior design",
                "Property transformation",
                "Multiple decoration styles",
                "Flexible credit system",
                "Commercial use license",
                "Instant generation",
                "Up to 4K resolution",
                "Automated before and after"
              ],
              "audience": {
                "@type": "Audience",
                "audienceType": ["Real Estate Agents", "Interior Designers", "Designers", "Property Photographers"]
              },
              "keywords": "AI image generator, real estate, virtual staging, interior decoration, interior design, real estate AI, professional property images, AI property transformation",
              "inLanguage": "en",
              "isAccessibleForFree": false,
              "browserRequirements": "Requires modern web browser",
              "softwareVersion": "1.0",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-950">
        <ParticlesBackground />
        <Header user={user} credits={credits} />

        <main className="flex-grow relative">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}

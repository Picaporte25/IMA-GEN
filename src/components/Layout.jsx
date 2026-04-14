import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { ParticlesBackground } from './ParticlesBackground';

export default function Layout({ children, title, user, credits }) {
  return (
    <>
      <Head>
        <title>{title || 'Gene-Image - AI Image Generator'}</title>
        <meta name="description" content="Create stunning AI-generated images with Gene-Image. Professional quality images in seconds using artificial intelligence." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-black">
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

import Link from 'next/link';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';
import { useState } from 'react';

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);

  const examplePrompts = [
    "A futuristic city at sunset with flying cars and neon lights, cyberpunk style...",
    "A swimming pool, camera halfway underwater showing colorful fish and nature...",
    "A magical forest with bioluminescent plants and mystical creatures...",
    "A cozy coffee shop interior with warm lighting and rustic furniture..."
  ];

  // Use a deterministic approach based on timestamp to select example
  const randomIndex = Math.floor(Date.now() / 1000) % examplePrompts.length;
  const selectedExample = examplePrompts[randomIndex];

  return {
    props: {
      user,
      credits: user?.credits || 0,
      selectedExample,
    },
  };
}

export default function Home({ user, credits, selectedExample }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: '',
          style: 'photorealistic',
          width: 1024,
          height: 1024,
          numberOfImages: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to generate images');
          return;
        }
        if (response.status === 402) {
          setError('Not enough credits. Please purchase more.');
          return;
        }
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.image && data.image.imageUrls && data.image.imageUrls.length > 0) {
        setGeneratedImage(data.image.imageUrls[0]);
      }

      setPrompt('');
    } catch (err) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  return (
    <Layout
      title="IMA-GEN - AI Image Generator | Create Stunning AI Images from Text"
      description="Transform your ideas into stunning AI-generated images with IMA-GEN. Professional quality, instant results, multiple styles and resolutions. Start creating for free!"
      keywords="AI image generator, text to image AI, artificial intelligence art, AI graphics creator, machine learning images, digital art generator, automated image creation, AI visual content"
      user={user}
      credits={credits}
    >
      {/* Hero Section - SEO Optimized */}
      <section className="relative min-h-[90vh] flex items-center bg-black" aria-label="AI Image Generator Hero Section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-300">Powered by Advanced AI</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Create </span>
                <span className="text-orange-500">Stunning</span>
                <br />
                <span className="text-violet-500">AI Images</span>
              </h1>
              <h2 className="text-xl text-gray-400 max-w-lg leading-relaxed">
                Transform your imagination into reality with our cutting-edge AI image generator. Professional quality, instant results.
              </h2>

              <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                Transform your imagination into reality with our cutting-edge AI image generator. Professional quality, instant results.
              </p>

              <div className="w-full max-w-2xl">
                <div className="bg-black border border-gray-700 rounded-xl p-6">
                  <textarea
                    id="heroPrompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedExample}
                    className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white text-lg resize-none focus:outline-none focus:border-violet-500 transition-colors"
                    rows={3}
                    disabled={generating}
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      💡 Example: "{selectedExample}"
                    </p>
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !prompt.trim()}
                      className="btn-primary px-8 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {generating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        'Generate Image'
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-black border border-red-500/50 rounded-lg">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}
                  {generatedImage && (
                    <div className="mt-4 p-4 bg-black border border-green-500/50 rounded-lg">
                      <p className="text-green-500 text-sm mb-3">✅ Image generated successfully!</p>
                      <img
                        src={generatedImage}
                        alt="Generated Image"
                        className="w-full rounded-lg border border-green-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Instant</div>
                    <div className="text-sm text-gray-500">Generation</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">4K</div>
                    <div className="text-sm text-gray-500">Resolution</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Free</div>
                    <div className="text-sm text-gray-500">Commercial</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right visual element */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Generated image showcase */}
                <div className="border-2 border-gray-700 rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/ima-gen-ai-generated-swimming-pool.png"
                    alt="AI generated photorealistic swimming pool image showing underwater and above water view with colorful fish, aquatic plants and sunlight caustic patterns"
                    className="w-full h-[450px] object-cover"
                  />
                  <div className="p-6 bg-black border-t border-gray-700">
                    <p className="text-sm text-gray-400 italic">
                      "A swimming pool, camera halfway underwater showing both above and below water level, colorful fish, lush green plants and trees surrounding the pool, sunlight filtering through water creating beautiful caustic patterns. Photorealistic style, cinematic lighting."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - SEO Optimized */}
      <section className="py-24 bg-black" aria-label="How AI Image Generation Works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">How AI Image </span>
              <span className="text-violet-500">Generation Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three simple steps to create professional AI-generated images for your projects
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <article className="card-modern relative">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl" aria-label="Step 1">
                1
              </div>
              <div className="w-16 h-16 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Describe Your Vision</h3>
              <p className="text-gray-400 mb-4">
                Write a detailed description of the AI image you want to create. Be specific about style, mood, and elements.
              </p>
              <div className="bg-black rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-orange-400 italic" lang="en">
                  "A cyberpunk city at sunset with neon lights and flying vehicles..."
                </p>
              </div>
            </article>

            {/* Step 2 */}
            <article className="card-modern relative">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold text-xl" aria-label="Step 2">
                2
              </div>
              <div className="w-16 h-16 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30 mb-6">
                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Customize Settings</h3>
              <p className="text-gray-400 mb-4">
                Choose your preferred AI art style, image resolution from 512px to 4K, and generation preferences.
              </p>
              <div className="flex items-center justify-center gap-3" aria-label="Available image styles">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30" title="Photorealistic"></div>
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30" title="Artistic"></div>
                <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30" title="Digital Art"></div>
              </div>
            </article>

            {/* Step 3 */}
            <article className="card-modern relative">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xl" aria-label="Step 3">
                3
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center border border-white/20 mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Generate & Download</h3>
              <p className="text-gray-400 mb-4">
                Get your unique, high-quality AI-generated image instantly. Full commercial use rights included.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-sm font-medium">HD Quality</span>
                </div>
                <div className="flex items-center gap-2 text-violet-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-sm font-medium">Commercial Use</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Stats Section - Social Proof */}
      <section className="py-20 bg-violet-500/10" aria-label="IMA-GEN Platform Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Trusted by Creators Worldwide
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">10M+</div>
              <div className="text-gray-400">AI Images Generated</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-violet-500 mb-2">500K+</div>
              <div className="text-gray-400">Happy Creators</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">4K</div>
              <div className="text-gray-400">Ultra HD Resolution</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-violet-500 mb-2">&lt;10s</div>
              <div className="text-gray-400">Generation Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - SEO Optimized */}
      <section className="py-24 bg-black" aria-label="Benefits of IMA-GEN AI Image Generator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">Why Choose </span>
              <span className="text-violet-500">IMA-GEN</span>
              <span className="text-white">?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most powerful and user-friendly AI image generator for creators, marketers, and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Lightning Fast",
                description: "Generate images in seconds. No waiting, no queues.",
                color: "orange"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Ultra HD Quality",
                description: "Professional output up to 4K resolution.",
                color: "violet"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Commercial License",
                description: "Use anywhere, forever. No restrictions.",
                color: "white"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Pay Per Use",
                description: "Only pay for what you generate. No subscriptions.",
                color: "green"
              }
            ].map((benefit, index) => (
              <div key={index} className="card-glass text-center p-6">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${
                  benefit.color === 'orange' ? 'bg-orange-500/20' :
                  benefit.color === 'violet' ? 'bg-violet-500/20' :
                  benefit.color === 'white' ? 'bg-white/20' :
                  'bg-green-500/20'
                } flex items-center justify-center ${
                  benefit.color === 'orange' ? 'text-orange-500' :
                  benefit.color === 'violet' ? 'text-violet-500' :
                  benefit.color === 'white' ? 'text-white' :
                  'text-green-500'
                }`}>
                  {benefit.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  benefit.color === 'orange' ? 'text-orange-400' :
                  benefit.color === 'violet' ? 'text-violet-400' :
                  'text-white'
                }`}>{benefit.title}</h3>
                <p className="text-sm text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Flat and modern */}
      <section className="py-24 bg-black relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Create Amazing Images?
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of creators who are already using IMA-GEN to bring their ideas to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/generate">
                <button className="btn-primary text-lg">
                  Start Creating Now
                </button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <button className="btn-primary text-lg">
                    Get Started Free
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="btn-outline text-lg">
                    View Pricing
                  </button>
                </Link>
              </>
            )}
          </div>
          <p className="mt-8 text-sm text-gray-500">
            No credit card required • Free trial available • Cancel anytime
          </p>
        </div>
      </section>
    </Layout>
  );
}

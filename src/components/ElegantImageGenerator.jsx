import { useState, useRef, useEffect } from 'react';
import { REAL_ESTATE_STYLES, calculateCredits, IMAGE_RESOLUTIONS } from '@/lib/nanoBanana';

export default function ElegantImageGenerator({ user, userCredits, onCreditUpdate }) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [resolution, setResolution] = useState(IMAGE_RESOLUTIONS[2]);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const creditsNeeded = calculateCredits(resolution.width, resolution.height, numberOfImages);
  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && mounted) {
      setReferenceImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear success message
    }
  };

  const handleRemoveImage = () => {
    if (mounted) {
      setReferenceImage(null);
      setPreviewUrl(null);
      setError('');
      setSuccess('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setReferenceImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(''); // Clear any previous errors
        setSuccess(''); // Clear success message
      } else {
        setError('Please drop an image file');
      }
    }
  };

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    const style = REAL_ESTATE_STYLES.find(s => s.id === styleId);
    if (style) {
      setPrompt(style.prompt);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if we have either a prompt or a selected style
    if (!prompt.trim() && !selectedStyle) {
      setError('Please describe your image or select a style');
      return;
    }

    // If only style is selected, use the style's prompt
    let finalPrompt = prompt.trim();
    if (!finalPrompt && selectedStyle) {
      const style = REAL_ESTATE_STYLES.find(s => s.id === selectedStyle);
      if (style && style.prompt) {
        finalPrompt = style.prompt;
      }
    }

    if (!finalPrompt) {
      setError('Please describe your image or select a style');
      return;
    }

    if (!hasEnoughCredits) {
      setError('Insufficient credits. Please purchase more.');
      return;
    }

    setGenerating(true);

    try {
      // Use JSON instead of FormData for better debugging
      const requestBody = {
        prompt: finalPrompt,
        negativePrompt: negativePrompt.trim(),
        style: selectedStyle,
        width: resolution.width,
        height: resolution.height,
        numberOfImages: numberOfImages
      };

      console.log('📤 Enviando solicitud de generación:', requestBody);

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📥 Respuesta status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate image');
      }

      const result = await response.json();
      console.log('✅ Generación exitosa:', result);

      setSuccess('Image generated successfully!');
      if (mounted && onCreditUpdate) {
        onCreditUpdate(userCredits - creditsNeeded);
      }
      // Only clear prompt if it was manually entered (not from style selection)
      if (!selectedStyle && mounted) {
        setPrompt('');
      }
      setNegativePrompt('');
      handleRemoveImage();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (mounted) {
        setError(err.message || 'Failed to generate image. Please try again.');
      }
    } finally {
      if (mounted) {
        setGenerating(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!user ? (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Login to Start Creating
            </h2>
            <p className="text-gray-400">
              Create an account to access our AI-powered image generation
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-violet-900/20"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-8 py-3 border border-white/20 hover:border-white/40 text-white font-medium rounded-full transition-all duration-300"
            >
              Create Account
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-light text-white/90 tracking-wide">
              Create Your Space
            </h1>
            <p className="text-sm text-white/50 font-light">
              Design unique environments with artificial intelligence
            </p>
          </div>

      {/* Reference Image Upload */}
      <div
        className="relative group"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`block transition-all duration-300 ${
            previewUrl
              ? 'ring-2 ring-violet-500/50 ring-offset-2 ring-offset-gray-900'
              : isDragging
              ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-gray-900'
              : 'hover:ring-2 hover:ring-violet-500/30 hover:ring-offset-2 hover:ring-offset-gray-900'
          }`}
        >
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-white/90 text-gray-900 rounded-full text-sm font-medium backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveImage();
                    }}
                    className="px-4 py-2 bg-red-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm hover:bg-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-white/20 hover:border-violet-500/50 hover:bg-violet-500/5'
            }`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white/70 text-sm font-light mb-1">
                Drop image here
              </p>
              <p className="text-white/40 text-xs">
                or click to browse
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Style Dropdown */}
      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-wider font-medium">
          Style
        </label>
        <div className="relative">
          <select
            value={selectedStyle}
            onChange={(e) => handleStyleSelect(e.target.value)}
            disabled={generating}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
          >
            <option value="">Custom</option>
            {REAL_ESTATE_STYLES.map((style) => (
              <option key={style.id} value={style.id} className="bg-gray-900">
                {style.icon} {style.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Prompt Input - Elegant and Delicate */}
      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-wider font-medium">
          Description
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your vision..."
          disabled={generating}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50 resize-none text-sm leading-relaxed"
        />
        {selectedStyle && (
          <p className="text-xs text-violet-400/80 pl-1">
            {REAL_ESTATE_STYLES.find(s => s.id === selectedStyle)?.description}
          </p>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-center text-xs text-white/50 hover:text-white/80 transition-colors py-2"
      >
        {showAdvanced ? '▲ Hide advanced options' : '▼ Show advanced options'}
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-medium">
              What to avoid
            </label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="people, pets, clutter..."
              disabled={generating}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50 resize-none text-sm"
            />
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-medium">
              Resolution
            </label>
            <div className="relative">
              <select
                value={resolution.id}
                onChange={(e) => setResolution(IMAGE_RESOLUTIONS.find(r => r.id === e.target.value))}
                disabled={generating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
              >
                {IMAGE_RESOLUTIONS.map((res) => (
                  <option key={res.id} value={res.id} className="bg-gray-900">
                    {res.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Number of Images */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-medium">
              Quantity
            </label>
            <div className="relative">
              <select
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                disabled={generating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="1" className="bg-gray-900">1 image</option>
                <option value="2" className="bg-gray-900">2 images</option>
                <option value="4" className="bg-gray-900">4 images</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credits Info - Subtle */}
      <div className="flex items-center justify-between px-2 py-3">
        <span className="text-xs text-white/50">
          Available credits
        </span>
        <span className={`text-sm font-light ${hasEnoughCredits ? 'text-white/80' : 'text-red-400'}`}>
          {userCredits}
        </span>
      </div>

      {/* Cost Display */}
      <div className="text-center">
        <span className="text-xs text-white/40">
          Cost: <span className="text-white/70 font-medium">{creditsNeeded} credits</span>
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400 text-sm text-center">{success}</p>
        </div>
      )}

      {/* Generate Button - Elegant */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={generating || !prompt.trim()}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-light tracking-wide rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-purple-600 shadow-lg shadow-violet-900/20 hover:shadow-violet-900/30"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate
          </span>
        )}
      </button>

      {!hasEnoughCredits && (
        <button
          type="button"
          onClick={() => window.location.href = '/checkout'}
          className="w-full py-3 text-violet-400 hover:text-violet-300 text-sm font-light transition-colors"
        >
          Buy credits
        </button>
      )}
        </>
      )}
    </div>
  );
}

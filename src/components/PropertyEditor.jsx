import { useState } from 'react';
import { REAL_ESTATE_PRESETS, editProperty, calculateControlNetCredits, IMAGE_RESOLUTIONS } from '@/lib/nanoBanana';

export default function PropertyEditor({ userCredits, onCreditUpdate }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const creditsNeeded = selectedPreset
    ? calculateControlNetCredits(1024, 1024, selectedPreset.preprocess)
    : 0;

  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setUploadedImage(file);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = (e) => {
    const url = e.target.value.trim();
    if (url) {
      setPreviewUrl(url);
      setImageUrl(url);
      setUploadedImage(null);
      setError('');
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setCustomPrompt('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalPrompt = customPrompt.trim() || selectedPreset?.defaultPrompt || prompt.trim();

    if (!finalPrompt) {
      setError('Please provide editing instructions');
      return;
    }

    if (!uploadedImage && !imageUrl) {
      setError('Please upload an image or provide an image URL');
      return;
    }

    if (!selectedPreset) {
      setError('Please select an editing preset');
      return;
    }

    if (!hasEnoughCredits) {
      setError(`Not enough credits. You need ${creditsNeeded - userCredits} more credits.`);
      return;
    }

    setEditing(true);

    try {
      const inputImage = imageUrl || previewUrl;
      const finalPromptWithCustom = customPrompt.trim()
        ? `${selectedPreset.defaultPrompt}, ${customPrompt}`
        : finalPrompt;

      const response = await editProperty(
        inputImage,
        finalPromptWithCustom,
        {
          controlScale: selectedPreset.controlScale,
          controlStart: selectedPreset.controlStart,
          controlEnd: selectedPreset.controlEnd,
          preprocess: selectedPreset.preprocess,
        }
      );

      setSuccess('Property edited successfully!');
      onCreditUpdate(userCredits - creditsNeeded);
      setPreviewUrl(response.imageUrl);
      setPrompt('');
      setCustomPrompt('');
      setUploadedImage(null);
      setImageUrl('');

      // Scroll to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to edit property. Please try again.');
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="card-glass max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-violet-500">Edit Your Property</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Property Image <span className="text-orange-500">*</span>
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Upload File
              </label>
              <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-violet-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={editing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      JPG, PNG, WebP, GIF, AVIF
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-400 mb-2">
                Or Image URL
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={handleUrlInput}
                placeholder="https://example.com/property-image.jpg"
                className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40"
                disabled={editing}
              />
            </div>
          </div>
        </div>

        {/* Editing Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Editing Type <span className="text-orange-500">*</span>
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {REAL_ESTATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`style-card text-center ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                disabled={editing}
              >
                <div className="text-2xl mb-2">{preset.icon}</div>
                <div className="text-sm font-semibold text-white">{preset.name}</div>
                <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-400 mb-2">
            Additional Instructions (optional)
          </label>
          <textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific details to your edit (e.g., 'make the walls terracotta brick', 'use modern white sofa'...)"
            className="textarea-futuristic"
            rows={3}
            disabled={editing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use the preset's default instructions.
          </p>
        </div>

        {/* Selected Preset Details */}
        {selectedPreset && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">
              Selected: {selectedPreset.icon} {selectedPreset.name}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Processing Method:</span>
                <span className="text-violet-400 font-medium">{selectedPreset.preprocess.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Control Level:</span>
                <span className="text-orange-400 font-medium">{Math.round(selectedPreset.controlScale * 100)}%</span>
              </div>
              <div className="text-gray-400">
                <span className="text-white">Default Instructions:</span> {selectedPreset.defaultPrompt}
              </div>
            </div>
          </div>
        )}

        {/* Cost Summary */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available credits:</span>
              <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-500' : 'text-red-500'}`}>
                {userCredits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Editing cost:</span>
              <span className="text-white font-medium">{creditsNeeded} credits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Credits remaining:</span>
              <span className="text-2xl font-bold text-white">
                {hasEnoughCredits ? userCredits - creditsNeeded : 'N/A'}
              </span>
            </div>
            {!hasEnoughCredits && selectedPreset && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-red-500 text-sm mb-2">
                  You need {creditsNeeded - userCredits} more credits
                </p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/checkout'}
                  className="btn-primary w-full text-sm"
                >
                  Buy Credits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Edit Button */}
        <button
          type="submit"
          disabled={editing || !previewUrl || !selectedPreset}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editing ? (
            <>
              <div className="spinner-small" />
              <span>Editing Property...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Property</span>
            </>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Tips for Better Results
        </h3>
        <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
          <li>Use high-quality, well-lit photos for best results</li>
          <li>Select the appropriate editing preset for your specific changes</li>
          <li>Add custom instructions for precise control over the editing process</li>
          <li>Higher resolution images cost more credits but produce better quality</li>
          <li>ControlNet preserves 100% of your original structure while making targeted changes</li>
        </ul>
      </div>
    </div>
  );
}

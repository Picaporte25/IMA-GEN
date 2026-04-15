import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ImageGallery({ userId }) {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [userId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/images?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl, prompt) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ima-gen-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image');
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images/delete?id=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(images.filter(img => img.id !== imageId));
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="card-glass max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="spinner-futuristic" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass max-w-6xl mx-auto">
        <div className="text-center py-20">
          <div className="text-status-error mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Failed to load images</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={fetchImages}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="card-glass max-w-6xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-card flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-text-primary mb-2">No images yet</h3>
          <p className="text-text-secondary mb-6">
            Start generating amazing AI images to see them here!
          </p>
          <button
            onClick={() => router.push('/generate')}
            className="btn-primary"
          >
            Generate Your First Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neon">Your Gallery</h2>
        <span className="text-text-secondary">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="image-card group">
            {image.image_urls && image.image_urls.length > 0 ? (
              <div className="relative">
                <img
                  src={image.image_urls[0]}
                  alt={image.prompt}
                  className="w-full aspect-square object-cover"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="image-card-overlay">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload(image.image_urls[0], image.prompt)}
                      className="btn-primary text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="btn-secondary text-sm text-status-error border-status-error hover:bg-status-error/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-bg-card flex items-center justify-center">
                <span className="text-text-muted">No image</span>
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-text-primary line-clamp-2 mb-2">{image.prompt}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{image.width}×{image.height}</span>
                <span>{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-accent-orange transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {selectedImage.image_urls && selectedImage.image_urls.length > 0 && (
              <img
                src={selectedImage.image_urls[0]}
                alt={selectedImage.prompt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
            <div className="mt-4 text-white">
              <p className="text-lg font-medium mb-2">{selectedImage.prompt}</p>
              <div className="flex gap-4 text-sm text-text-secondary">
                <span>Resolution: {selectedImage.width}×{selectedImage.height}</span>
                <span>Created: {new Date(selectedImage.created_at).toLocaleString()}</span>
                {selectedImage.style && <span>Style: {selectedImage.style}</span>}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleDownload(selectedImage.image_urls[0], selectedImage.prompt)}
                  className="btn-primary"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

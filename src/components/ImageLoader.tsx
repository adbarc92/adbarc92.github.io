import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ImageLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        <img
          src="/api/placeholder/400/300"
          alt="Example image"
          className={`w-full h-auto rounded-lg ${
            loading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load image. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageLoader;

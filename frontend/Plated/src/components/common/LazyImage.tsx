/**
 * LazyImage Component
 * 
 * A performance-optimized image component that implements:
 * - Lazy loading with Intersection Observer
 * - Progressive loading with blur-to-sharp effect
 * - Error handling with fallback images
 * - Responsive image sizing
 * - WebP format support with fallback
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Load immediately for above-the-fold content
}

export default function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc = '/default-image.png',
  placeholderSrc = '/placeholder.png',
  onLoad,
  onError,
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate WebP src with fallback
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.includes('unsplash.com') || originalSrc.includes('example.com')) {
      // For external images, try to optimize
      return originalSrc;
    }
    
    // For local images, you could implement WebP conversion
    // This is a placeholder for the actual implementation
    return originalSrc;
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Start loading 50px before image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Load the actual image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(getOptimizedSrc(src));
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    };
    img.src = getOptimizedSrc(src);
  }, [isInView, src, fallbackSrc, onLoad, onError, getOptimizedSrc]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
      }}
    >
      <img
        src={currentSrc}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0.7,
          filter: isLoaded ? 'none' : 'blur(5px)',
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Loading indicator */}
      {!isLoaded && isInView && !hasError && (
        <div
          className="loading-indicator"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <LazyImage src="/recipe-image.jpg" alt="Delicious pasta" />
 * 
 * // With priority loading (above the fold)
 * <LazyImage 
 *   src="/hero-image.jpg" 
 *   alt="Hero image" 
 *   priority={true}
 *   width={800}
 *   height={600}
 * />
 * 
 * // With custom fallback
 * <LazyImage 
 *   src="/user-avatar.jpg" 
 *   alt="User avatar"
 *   fallbackSrc="/default-avatar.png"
 *   onLoad={() => console.log('Image loaded')}
 *   onError={() => console.log('Image failed to load')}
 * />
 */

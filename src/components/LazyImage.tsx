"use client";

import { useState, useRef, useEffect, memo } from "react";

interface LazyImageProps {
  src?: string;
  alt: string;
  fallback?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage = memo(({ 
  src, 
  alt, 
  fallback = "/api/placeholder/avatar", 
  width = 40, 
  height = 40, 
  className = "",
  style = {}
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load image when in view
  useEffect(() => {
    if (isInView && src && !hasError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setImageSrc(fallback);
        setIsLoading(false);
      };
      img.src = src;
    } else if (isInView && !src) {
      setImageSrc(fallback);
      setIsLoading(false);
    }
  }, [isInView, src, fallback, hasError]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: "#f3f4f6",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.2s ease-in-out",
  };

  const placeholderStyle: React.CSSProperties = {
    width: "60%",
    height: "60%",
    backgroundColor: "#d1d5db",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500",
  };

  // Generate initials from alt text (usually name)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div ref={imgRef} className={className} style={containerStyle}>
      {isLoading ? (
        <div style={placeholderStyle}>
          <div 
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #9ca3af",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : imageSrc ? (
        <img 
          src={imageSrc} 
          alt={alt}
          style={imageStyle}
          loading="lazy"
        />
      ) : (
        <div style={placeholderStyle}>
          {getInitials(alt)}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;
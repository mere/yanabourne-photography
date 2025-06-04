import { useEffect, useRef } from 'react';
import type { ImageMetadata } from 'astro';

interface Props {
  src: ImageMetadata;
  alt: string;
}

export default function AnimatedImage({ src, alt }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0
    });

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <>
      <img
        ref={imgRef}
        src={src.src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-500 opacity-0"
        style={{ aspectRatio: src.width / src.height }}
      />
      <style jsx>{`
        img.loaded {
          @apply opacity-100;
        }
      `}</style>
    </>
  );
} 
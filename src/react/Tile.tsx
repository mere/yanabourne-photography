import { useEffect, useRef, useState } from 'react';
import type { ImageMetadata } from 'astro';
import { Image } from "@unpic/react";

interface Props {
  image?: string;
  imageAlt?: string;
  text?: string;
  className?: string;
  link?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Tile({ 
  image, 
  imageAlt = '', 
  text = '', 
  className = '',
  onClick
}: Props) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [resolvedImage, setResolvedImage] = useState<ImageMetadata | null>(null);


  useEffect(() => {
    if (!tileRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tile = entry.target as HTMLElement;
          tile.classList.add('animate');
          observer.unobserve(tile);
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0
    });

    observer.observe(tileRef.current);

    return () => {
      if (tileRef.current) {
        observer.unobserve(tileRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={tileRef} 
      className={`relative overflow-hidden user-select-none bg-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="relative w-full h-full">
           <Image
            src={`${import.meta.env.PUBLIC_URL}/api/get-raw-image/?key=${image}`}
            layout="fullWidth"
            alt={imageAlt}
            fallback={import.meta.env.PUBLIC_LOCAL ? "astro" : "netlify"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {text && (
        <div className={`p-4 ${!image ? 'absolute inset-0 flex items-center justify-center' : 'absolute bottom-0 left-0 right-0'} font-karla font-light text-sm text-center mix-blend-difference`}>
          <p className="text-gray-600">{text}</p>
        </div>
      )}
    </div>
  );
} 
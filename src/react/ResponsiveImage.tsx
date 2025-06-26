import { useState } from 'react';

interface Props {
  id: string;
  w: number;
  h: number;
  site: string;
  alt: string;
  thumbUrl?: string;
}

export function ResponsiveImage({ id, w, h, site, alt, thumbUrl }: Props) {
  const [thumbError, setThumbError] = useState(false);

  const src = thumbUrl && !thumbError
    ? `${site}/api/get-raw-image?key=${encodeURIComponent(thumbUrl)}`
    : (() => {
        const originalSrc = encodeURIComponent(`${site}/api/get-raw-image?key=${id}`);
        return `${site}/.netlify/images?w=${w}&h=${h}&fit=contain&url=${originalSrc}`;
      })();

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${thumbUrl && !thumbError ? 'border-2 border-green-500' : ''}`}
        onError={() => {
          if (thumbUrl) {
            setThumbError(true);
          }
        }}
      />
      
    </div>
  );
}


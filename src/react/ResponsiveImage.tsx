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

  const cookies = document.cookie.split(';');
  const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
  const hasCookie = adminSecretCookie ? adminSecretCookie.split('=')[1] : '';

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
      {hasCookie && thumbUrl && !thumbError && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
          thumb
        </div>
      )}
      {thumbUrl && thumbError && (
        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
          ❌ No Thumb
        </div>
      )}
    </div>
  );
}


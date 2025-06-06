import type { FC } from 'react';

interface ResponsiveImageProps {
  id: string;
  w: number;
  h: number;
  site: string;
  alt: string;
}


export const ResponsiveImage: FC<ResponsiveImageProps> = ({ id, w, h=w*5, site, alt }) => {

    const originalSrc = encodeURIComponent(`${site}/api/get-raw-image?key=${id}`);
    //const responsiveUrl = `${site}/_image?w=${w}&h=${h}&fit=contain&href=${originalSrc}`
    const responsiveUrl = `${site}/.netlify/images?w=${w}&h=${h}&fit=contain&url=${originalSrc}`
  return (
    <img
      src={responsiveUrl}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
};


import {
  defaultPhotoSrc,
  photoDimensions,
  photoSrcSet,
  tileSizes,
} from '../lib/photos';

interface Props {
  id: string;
  w: number;
  h: number;
  alt: string;
}

export function ResponsiveImage({ id, w, alt }: Props) {
  if (!id) return null;

  const dims = photoDimensions(id);
  const src = defaultPhotoSrc(id, 480);
  const srcSet = photoSrcSet(id);

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        srcSet={srcSet || undefined}
        sizes={tileSizes(w)}
        width={dims?.width}
        height={dims?.height}
        alt={alt}
        className="util-image w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
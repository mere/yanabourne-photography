export interface GalleryTile {
  id: string;
  imageUrl: string;
  altText: string;
  description: string;
  link?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Gallery {
  title: string;
  slug: string;
  layout: GalleryTile[];
  createdAt: number;
  updatedAt: number;
} 
import about from '../content/galleries/about.json';
import blackAndWhite from '../content/galleries/black-and-white.json';
import bookMe from '../content/galleries/book-me.json';
import businessPortraits from '../content/galleries/business-portraits.json';
import colourPlay from '../content/galleries/colour-play.json';
import events from '../content/galleries/events.json';
import femininity from '../content/galleries/femininity.json';
import film from '../content/galleries/film.json';
import home from '../content/galleries/home.json';
import loveStories from '../content/galleries/love-stories.json';
import maternity from '../content/galleries/maternity.json';
import portraitsAndLifestyle from '../content/galleries/portraits-and-lifestyle.json';
import property from '../content/galleries/property.json';
import saffronAndSpirulina from '../content/galleries/saffron-and-spirulina.json';
import tales from '../content/galleries/tales.json';

export interface GalleryTile {
  id: string;
  imageUrl: string;
  altText: string;
  title: string;
  description: string;
  link: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GalleryData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  layout: GalleryTile[];
}

const galleriesBySlug: Record<string, GalleryData> = {
  about: about as GalleryData,
  'black-and-white': blackAndWhite as GalleryData,
  'book-me': bookMe as GalleryData,
  'business-portraits': businessPortraits as GalleryData,
  'colour-play': colourPlay as GalleryData,
  events: events as GalleryData,
  femininity: femininity as GalleryData,
  film: film as GalleryData,
  home: home as GalleryData,
  'love-stories': loveStories as GalleryData,
  maternity: maternity as GalleryData,
  'portraits-and-lifestyle': portraitsAndLifestyle as GalleryData,
  property: property as GalleryData,
  'saffron-and-spirulina': saffronAndSpirulina as GalleryData,
  tales: tales as GalleryData,
};

/** Photo gallery slugs rendered at `/gallery/[slug]`. */
export const photoGallerySlugs = Object.keys(galleriesBySlug).filter(
  (slug) => !['home', 'about', 'book-me'].includes(slug),
);

export function getGallery(slug: string): GalleryData | undefined {
  return galleriesBySlug[slug];
}

export function getHomeNavLinks(): { description: string; link: string }[] {
  const homeGallery = getGallery('home');
  if (!homeGallery) return [];
  return homeGallery.layout
    .filter((tile) => tile.link)
    .map((tile) => ({ description: tile.description, link: tile.link }));
}
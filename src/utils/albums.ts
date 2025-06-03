const fs = await import("node:fs/promises");
const path = await import("node:path");

const imageLocation = "/src/assets/albums/";
const allImages = import.meta.glob<{ default: ImageMetadata }>(
  `/src/assets/albums/**/*.{jpeg,jpg,png,webp,JPG}`
);

// infer album names from the assets/albums directory
export async function getAlbumNames() {
  const albumNames = Object.keys(allImages).map((key) =>
    key.replace(imageLocation, "").split("/")[0]
  );
  return [...new Set(albumNames)];
}

export async function getAlbumCover(folderName: string) {
  const image = allImages[`${imageLocation}${folderName}/cover.jpg`];
  if (!image) {
    console.error(`No cover image found for ${folderName}`);
    return (await getImagesFromAlbum(folderName))[0][1];
  }
  return (await image()).default;
}

export async function getAlbumCovers() {
  const albumNames = await getAlbumNames();
  const covers = await Promise.all(albumNames.map(async (name) => {
    const cover = await getAlbumCover(name);
    return [
      name,
      cover,
    ];
  }));
  return Object.fromEntries(covers);
}



export async function getImagePathsFromAlbum(folderName: string) {
  const imageNames = Object.keys(allImages).filter((key) =>
    key.includes(`/${folderName}/`)
  );
  return imageNames;
}

export async function getImagesFromAlbum(folderName: string) {
  const imageNames = Object.keys(allImages).filter((key) =>
    key.includes(`/${folderName}/`)
  );
  const images = await Promise.all(imageNames.map(async (name) => {
    return [name, (await allImages[name]()).default]
  }))
  return images;
}

export const folderName2id = (folder: string) => {
  return folder.replace(/ /g, "-").toLowerCase();
};

export async function id2folderName(id: string) {
  const albumNames = await getAlbumNames();
  return albumNames.find((name) => folderName2id(name) === id);
}

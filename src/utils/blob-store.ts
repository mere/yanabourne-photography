import { getStore as getStoreFromNetlify } from "@netlify/blobs";

export const getStore = (key: string) => {
  if (import.meta.env.NETLIFY_SITE_ID && import.meta.env.NETLIFY_BLOBS_TOKEN) {
  return getStoreFromNetlify({
    name: key,
    siteID: import.meta.env.NETLIFY_SITE_ID,
    token: import.meta.env.NETLIFY_BLOBS_TOKEN,
  });
} else {
    return getStoreFromNetlify(key);
}
};
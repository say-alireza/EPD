const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Cache busting version for media assets to bust stale browser cache.
 */
const MEDIA_VERSION = "20261002_hd2";

/**
 * Prefix static asset path with NEXT_PUBLIC_BASE_PATH and bust stale browser cache on media.
 * Usage:
 *   assetPath("/images/poster.jpg") => "/images/poster.jpg"
 *   assetPath("/media/posters/poster.jpg") => "/media/posters/poster.jpg?v=20261002_hd2"
 */
export function assetPath(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/media/") && !cleanPath.includes("?")) {
    return `${basePath}${cleanPath}?v=${MEDIA_VERSION}`;
  }
  return `${basePath}${cleanPath}`;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prefix static asset path with NEXT_PUBLIC_BASE_PATH.
 * Usage:
 *   assetPath("/images/poster.jpg") => "/EPD/images/poster.jpg" or "/images/poster.jpg" depending on env var.
 */
export function assetPath(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}

import manifest from '../../data/media-manifest.json';

/** Real pixel size of a web image, from the media manifest. */
export function dim(path: string): { width: number; height: number } {
  const hit = (manifest as { path: string; width: number; height: number }[]).find((m) => m.path === path);
  if (!hit) throw new Error(`story: ${path} is not in media-manifest.json`);
  return { width: hit.width, height: hit.height };
}

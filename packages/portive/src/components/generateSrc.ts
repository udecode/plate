export function generateSrc({
  originUrl,
  size,
  maxSize,
}: {
  originUrl?: string;
  size?: [number, number];
  maxSize?: [number, number];
}) {
  if (!originUrl || !size || !maxSize) return;

  /**
   * If it's a url from `createObjectURL` then just return it
   */
  if (originUrl.startsWith('blob:')) return originUrl;
  if (size[0] >= maxSize[0] || size[1] >= maxSize[1]) return originUrl;
  return `${originUrl}?size=${size[0]}x${size[1]}`;
}

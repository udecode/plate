function generateSrc({
  url,
  size,
  maxSize,
}: {
  url: string;
  size: [number, number];
  maxSize: [number, number];
}) {
  /**
   * If it's a url from `createObjectURL` then just return it
   */
  if (url.startsWith('blob:')) return url;
  if (size[0] >= maxSize[0] || size[1] >= maxSize[1]) return url;
  if (url.endsWith('.gif')) return url;
  return `${url}?size=${size[0]}x${size[1]}`;
}

function generateSrcSet({
  url,
  size,
  maxSize,
}: {
  url: string;
  size: [number, number];
  maxSize: [number, number];
}) {
  /**
   * If it's a url from `createObjectURL` then just return it
   */
  if (url.startsWith('blob:')) return url;
  const src1x = generateSrc({
    url,
    size,
    maxSize,
  });
  const src2x = generateSrc({
    url,
    size: [size[0] * 2, size[1] * 2],
    maxSize,
  });
  return `${src1x}, ${src2x} 2x`;
}

export function generateSrcAndSrcSet({
  url,
  size,
  maxSize,
}: {
  url?: string;
  size: [number, number];
  maxSize: [number, number];
}) {
  if (url === undefined) {
    return { src: '', srcSet: '' };
  }
  const src = generateSrc({ url, size, maxSize });
  const srcSet = generateSrcSet({ url, size, maxSize });
  return { src, srcSet };
}

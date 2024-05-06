function generateSrc({
  maxSize,
  size,
  url,
}: {
  maxSize: [number, number];
  size: [number, number];
  url: string;
}) {
  /** If it's a url from `createObjectURL` then just return it */
  if (url.startsWith('blob:')) return url;
  if (size[0] >= maxSize[0] || size[1] >= maxSize[1]) return url;
  if (url.endsWith('.gif')) return url;

  return `${url}?size=${size[0]}x${size[1]}`;
}

function generateSrcSet({
  maxSize,
  size,
  url,
}: {
  maxSize: [number, number];
  size: [number, number];
  url: string;
}) {
  /** If it's a url from `createObjectURL` then just return it */
  if (url.startsWith('blob:')) return url;

  const src1x = generateSrc({
    maxSize,
    size,
    url,
  });
  const src2x = generateSrc({
    maxSize,
    size: [size[0] * 2, size[1] * 2],
    url,
  });

  return `${src1x}, ${src2x} 2x`;
}

export function generateSrcAndSrcSet({
  maxSize,
  size,
  url,
}: {
  maxSize: [number, number];
  size: [number, number];
  url?: string;
}) {
  if (url === undefined) {
    return { src: '', srcSet: '' };
  }

  const src = generateSrc({ maxSize, size, url });
  const srcSet = generateSrcSet({ maxSize, size, url });

  return { src, srcSet };
}

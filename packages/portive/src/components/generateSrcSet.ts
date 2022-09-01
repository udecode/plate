import { generateSrc } from './generateSrc';

export function generateSrcSet({
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
  const src1x = generateSrc({
    originUrl,
    size,
    maxSize,
  });
  const src2x = generateSrc({
    originUrl,
    size: [size[0] * 2, size[1] * 2],
    maxSize,
  });
  return `${src1x}, ${src2x} 2x`;
}

export const getRtfImageMimeType = (imageData: string): string | null => {
  const [bliptagMeta] = imageData.split('bliptag');

  if (bliptagMeta.includes('pngblip')) {
    return 'image/png';
  }

  if (bliptagMeta.includes('jpegblip')) {
    return 'image/jpeg';
  }

  return null;
};

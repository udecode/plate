import { RtfImage } from '../types';
import { getRtfImageHex } from './getRtfImageHex';
import { getRtfImageMimeType } from './getRtfImageMimeType';
import { getRtfImageSpid } from './getRtfImageSpid';

export const getRtfImagesByType = (
  rtf: string,
  spidPrefix: string,
  type: string
): RtfImage[] => {
  const [, ...images] = rtf.split(type);

  return images.reduce<RtfImage[]>((rtfImages, image) => {
    const [, imageData = ''] = image.split('shplid');
    const spid = getRtfImageSpid(imageData, spidPrefix);
    const mimeType = getRtfImageMimeType(imageData);
    const hex = getRtfImageHex(imageData);

    if (spid && mimeType && hex) {
      rtfImages.push({ hex, mimeType, spid });
    }

    return rtfImages;
  }, []);
};

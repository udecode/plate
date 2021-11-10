import { RtfImagesMap } from '../types';
import { getRtfImagesByType } from './getRtfImagesByType';

export const getRtfImagesMap = (rtf: string): RtfImagesMap => {
  const rtfImagesMap: RtfImagesMap = {};

  const shppictRtfImages = getRtfImagesByType(rtf, 'i', '\\shppict');
  for (const shppictRtfImage of shppictRtfImages) {
    rtfImagesMap[shppictRtfImage.spid] = shppictRtfImage;
  }

  const shpRtfImages = getRtfImagesByType(rtf, 's', '\\shp');
  for (const shpRtfImage of shpRtfImages) {
    rtfImagesMap[shpRtfImage.spid] = shpRtfImage;
  }

  return rtfImagesMap;
};

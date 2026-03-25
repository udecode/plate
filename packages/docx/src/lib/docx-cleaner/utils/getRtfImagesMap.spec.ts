import { getRtfImagesMap } from './getRtfImagesMap';

describe('getRtfImagesMap', () => {
  it('merges shppict and shp images into one lookup map', () => {
    const rtf = [
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
      String.raw`\shppict shplid1025 pngblip bliptag 62657965}`,
      String.raw`\shp shplid2049 jpegblip bliptag ffd8ff}`,
      String.raw`\shp shplid9999 emfblip bliptag 00}`,
    ].join(' ');

    expect(getRtfImagesMap(rtf)).toEqual({
      i1025: { hex: '62657965', mimeType: 'image/png', spid: 'i1025' },
      s2049: { hex: 'ffd8ff', mimeType: 'image/jpeg', spid: 's2049' },
    });
  });
});

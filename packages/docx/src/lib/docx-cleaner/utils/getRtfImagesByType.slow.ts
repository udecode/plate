import { getRtfImagesByType } from './getRtfImagesByType';

describe('getRtfImagesByType', () => {
  it('extracts only valid images of the requested rtf type', () => {
    const rtf = [
      String.raw`\shppict shplid1025 pngblip bliptag 68 65 6c 6c 6f}`,
      String.raw`\shppict shplid2049 jpegblip bliptag blipuid abc} ff d8 ff }`,
      String.raw`\shppict shplid3000 emfblip bliptag 00}`,
      String.raw`\shp shplid4097 pngblip bliptag 616263}`,
    ].join(' ');

    expect(getRtfImagesByType(rtf, 'i', String.raw`\shppict`)).toEqual([
      { hex: '68656c6c6f', mimeType: 'image/png', spid: 'i1025' },
      { hex: 'ffd8ff', mimeType: 'image/jpeg', spid: 'i2049' },
    ]);
  });

  it('does not treat shppict blocks as shp images', () => {
    const rtf = [
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
      String.raw`\shp shplid4097 pngblip bliptag 616263}`,
    ].join(' ');

    expect(getRtfImagesByType(rtf, 's', String.raw`\shp`)).toEqual([
      { hex: '616263', mimeType: 'image/png', spid: 's4097' },
    ]);
  });
});

import { getImageDimensions } from './image-dimensions';

describe('getImageDimensions', () => {
  it('parses png dimensions from the IHDR bytes', () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    png.set([0x00, 0x00, 0x01, 0x40], 16);
    png.set([0x00, 0x00, 0x00, 0xf0], 20);

    expect(getImageDimensions(png)).toEqual({
      height: 240,
      type: 'png',
      width: 320,
    });
  });

  it('falls back for malformed jpeg buffers', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x00]);

    expect(getImageDimensions(jpeg)).toEqual({
      height: 100,
      type: 'jpg',
      width: 100,
    });
  });

  it('returns the default unknown dimensions for unsupported formats', () => {
    expect(getImageDimensions(new Uint8Array([0x01, 0x02, 0x03]))).toEqual({
      height: 100,
      type: 'unknown',
      width: 100,
    });
  });
});
